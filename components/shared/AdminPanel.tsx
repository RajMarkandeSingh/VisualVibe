"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const AdminPanel = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Only show the admin panel to the designated admin user
  if (user?.id !== process.env.NEXT_PUBLIC_ADMIN_ID) {
    return null;
  }

  const makeMeAdmin = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/make-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You are now an admin with unlimited credits!",
          duration: 5000,
          className: "success-toast",
        });
        // Refresh the page to show admin status
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to make you admin",
          duration: 5000,
          className: "error-toast",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        duration: 5000,
        className: "error-toast",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
      <h3 className="text-lg font-semibold text-purple-800 mb-4">
        🛠️ Admin Panel
      </h3>
      <p className="text-sm text-purple-600 mb-4">
        Make yourself an admin to get unlimited credits for testing and development.
      </p>
      <Button
        onClick={makeMeAdmin}
        disabled={isLoading}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        {isLoading ? "Making Admin..." : "Make Me Admin"}
      </Button>
    </div>
  );
};

export default AdminPanel; 