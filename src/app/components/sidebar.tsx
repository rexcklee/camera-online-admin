"use client";
import { Button } from "antd";
import Link from "next/link";
import React from "react";
import { BsShop, BsPerson, BsListCheck } from "react-icons/bs";
import { MdOutlineCategory } from "react-icons/md";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useAuth } from "@/provider/authProvider";
import API from "@/apis/api";

export const Sidebar: React.FC = () => {
  const { currentUser } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    API.setCurrentUserToLocalStorage(null);
    API.setTokenToLocalStorage(null);
    Cookies.remove("token");
    router.replace("/login");
  };

  return (
    <div className="border border-gray-200 rounded-md bg-gray-50 p-6 h-full w-full">
      {currentUser && <p className="mb-4">Welcome, {currentUser.name}!</p>}
      <nav>
        <ul>
          <li key="Home" className="mb-2">
            <Link href="/" className="text-sm">
              <BsShop className="h-3 w-3 inline-block mr-2" />
              Home
            </Link>
          </li>
          <li key="Category" className="mb-2">
            <Link href="/dashboard/category" className="text-sm">
              <MdOutlineCategory className="h-3 w-3 inline-block mr-2" />
              Category
            </Link>
          </li>
          <li key="SubCategory" className="mb-2">
            <Link href="/dashboard/subCategory" className="text-sm">
              <MdOutlineCategory className="h-3 w-3 inline-block mr-2" />
              Sub-Category
            </Link>
          </li>
          <li key="User" className="mb-2">
            <Link href="/dashboard/user" className="text-sm">
              <BsPerson className="h-3 w-3 inline-block mr-2" />
              User
            </Link>
          </li>
          <li key="Logout" className="mb-2">
            <Button onClick={handleLogout} className="text-sm">
              Log Out
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  );
};
