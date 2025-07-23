import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById, createUser } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const AddTransformationType = async ({ params: { type } }: SearchParamProps) => {
  const { userId } = auth();
  const transformation = transformationTypes[type];

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

  return (
    <>
      <Header
        title={transformation.title}
        subtitle={transformation.subTitle}
      />
      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={user.clerkId}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  )
}

export default AddTransformationType;