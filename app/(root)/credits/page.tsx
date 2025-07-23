import { SignedIn, auth } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";

import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { plans } from "@/constants";
import { getUserById, createUser, getUserCreditBalance } from "@/lib/actions/user.actions";
import Checkout from "@/components/shared/Checkout";
import AdminPanel from "@/components/shared/AdminPanel";

const Credits = async () => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  let user;
  try {
    user = await getUserById(userId);
  } catch (error) {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const clerkUser = await clerkClient.users.getUser(userId);
    user = await createUser({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      username: clerkUser.username || clerkUser.emailAddresses[0].emailAddress.split("@")[0] || clerkUser.id,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      photo: clerkUser.imageUrl,
    });
  }

  const creditBalance = await getUserCreditBalance(userId);

  return (
    <>
      <Header
        title="Buy Credits"
        subtitle={user.isAdmin ? "You have unlimited credits as an admin!" : "Choose a credit package that suits your needs!"}
      />

      {/* Admin Panel for making yourself admin */}
      <div className="mb-8">
        <AdminPanel />
      </div>

      {user.isAdmin && (
        <div className="mb-8 p-4 bg-purple-100 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/icons/coins.svg"
              alt="admin coins"
              width={30}
              height={30}
            />
            <div>
              <h3 className="p-16-semibold text-purple-600">Admin Status Active</h3>
              <p className="p-14-medium text-purple-500">You have unlimited credits: {creditBalance}</p>
            </div>
          </div>
        </div>
      )}

      <section>
        <ul className="credits-list">
          {plans.map((plan) => (
            <li key={plan.name} className="credits-item">
              <div className="flex-center flex-col gap-3">
                <Image src={plan.icon} alt="check" width={50} height={50} />
                <p className="p-20-semibold mt-2 text-purple-500">
                  {plan.name}
                </p>
                <p className="h1-semibold text-dark-600">${plan.price}</p>
                <p className="p-16-regular">{plan.credits} Credits</p>
              </div>

              {/* Inclusions */}
              <ul className="flex flex-col gap-5 py-9">
                {plan.inclusions.map((inclusion) => (
                  <li
                    key={plan.name + inclusion.label}
                    className="flex items-center gap-4"
                  >
                    <Image
                      src={`/assets/icons/${
                        inclusion.isIncluded ? "check.svg" : "cross.svg"
                      }`}
                      alt="check"
                      width={24}
                      height={24}
                    />
                    <p className="p-16-regular">{inclusion.label}</p>
                  </li>
                ))}
              </ul>

              {plan.name === "Free" ? (
                <Button variant="outline" className="credits-btn">
                  Free Consumable
                </Button>
              ) : user.isAdmin ? (
                <Button variant="outline" className="credits-btn" disabled>
                  Not Needed (Admin)
                </Button>
              ) : (
                <SignedIn>
                  <Checkout
                    plan={plan.name}
                    amount={plan.price}
                    credits={plan.credits}
                    buyerId={user._id}
                  />
                </SignedIn>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Credits;