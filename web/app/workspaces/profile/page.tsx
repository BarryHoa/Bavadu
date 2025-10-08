"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Textarea } from "@heroui/input";
import { SelectItem } from "@heroui/select";
import { parseDate } from "@internationalized/date";
import InputBase from "@/components/base/Input";
import SelectBase from "@/components/base/Select";
import DatePickerBase from "@/components/base/DatePicker";
import AwardsCertifications from "./components/AwardsCertifications";
import DigitalSignature from "./components/DigitalSignature";
import DocumentList from "./components/DocumentList";
import UserRole from "./components/UserRole";
import ChangePasswordModal from "./components/ChangePasswordModal";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Camera,
  Save,
  Globe,
  Github,
  Linkedin,
  Twitter,
  UserCircle,
} from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card - Left Side */}
        <Card className="lg:col-span-1">
          <CardBody className="p-6 relative">
            <UserRole role="Super Admin" color="primary" />

            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar
                  src="https://i.pravatar.cc/150?u=user"
                  className="w-32 h-32"
                  isBordered
                  color="primary"
                />
                <Button
                  isIconOnly
                  size="sm"
                  color="primary"
                  className="absolute bottom-0 right-0"
                  radius="full"
                >
                  <Camera size={16} />
                </Button>
              </div>

              <div className="flex gap-2">
                <DocumentList />
                <ChangePasswordModal />
              </div>

              <AwardsCertifications />

              <DigitalSignature />
            </div>
          </CardBody>
        </Card>

        {/* Main Content - Right Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center">
                <User size={20} className="mr-2" />
                Personal Information
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">First Name</label>
                  <InputBase
                    placeholder="Enter first name"
                    defaultValue="John"
                    variant="bordered"
                    startContent={<User size={16} className="text-gray-400" />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <InputBase
                    placeholder="Enter last name"
                    defaultValue="Doe"
                    variant="bordered"
                    startContent={<User size={16} className="text-gray-400" />}
                  />
                </div>
              </div>

              {/* Nickname / Display Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Nickname / Display Name
                </label>
                <InputBase
                  placeholder="Enter nickname or display name"
                  defaultValue="JD"
                  variant="bordered"
                  startContent={
                    <UserCircle size={16} className="text-gray-400" />
                  }
                />
              </div>

              {/* Gender & Date of Birth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Gender</label>
                  <SelectBase
                    placeholder="Select gender"
                    variant="bordered"
                    defaultSelectedKeys={["male"]}
                  >
                    <SelectItem key="male">Male</SelectItem>
                    <SelectItem key="female">Female</SelectItem>
                    <SelectItem key="other">Other</SelectItem>
                    <SelectItem key="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </SelectBase>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <DatePickerBase
                    defaultValue={parseDate("1990-01-15")}
                    minValue={parseDate("1945-01-01")}
                    maxValue={parseDate(new Date().toISOString().split("T")[0])}
                    showMonthAndYearPickers
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <InputBase
                    type="email"
                    placeholder="Enter email address"
                    defaultValue="john.doe@example.com"
                    variant="bordered"
                    startContent={<Mail size={16} className="text-gray-400" />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <InputBase
                    type="tel"
                    placeholder="Enter phone number"
                    defaultValue="+1 (555) 123-4567"
                    variant="bordered"
                    startContent={<Phone size={16} className="text-gray-400" />}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Address</label>
                <InputBase
                  placeholder="Enter full address"
                  defaultValue="123 Main Street, San Francisco, CA 94102"
                  variant="bordered"
                  startContent={<MapPin size={16} className="text-gray-400" />}
                />
              </div>

              {/* Job Title */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Job Title</label>
                <InputBase
                  placeholder="Enter job title"
                  defaultValue="Senior Developer"
                  variant="bordered"
                  startContent={
                    <Briefcase size={16} className="text-gray-400" />
                  }
                />
              </div>

              {/* Bio / Description */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Bio / Description</label>
                <Textarea
                  placeholder="Tell us about yourself..."
                  defaultValue="Passionate developer with 5+ years of experience in building web applications. Love coding and learning new technologies."
                  variant="bordered"
                  minRows={4}
                  maxRows={8}
                />
              </div>
            </CardBody>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center">
                <Globe size={20} className="mr-2" />
                Social Links
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Website</label>
                <InputBase
                  type="url"
                  placeholder="https://yourwebsite.com"
                  defaultValue="https://johndoe.com"
                  variant="bordered"
                  startContent={<Globe size={16} className="text-gray-400" />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">GitHub</label>
                  <InputBase
                    placeholder="github.com/username"
                    defaultValue="github.com/johndoe"
                    variant="bordered"
                    startContent={
                      <Github size={16} className="text-gray-400" />
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">LinkedIn</label>
                  <InputBase
                    placeholder="linkedin.com/in/username"
                    defaultValue="linkedin.com/in/johndoe"
                    variant="bordered"
                    startContent={
                      <Linkedin size={16} className="text-gray-400" />
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Twitter</label>
                <InputBase
                  placeholder="@username"
                  defaultValue="@johndoe"
                  variant="bordered"
                  startContent={<Twitter size={16} className="text-gray-400" />}
                />
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="bordered">Cancel</Button>
            <Button color="secondary">
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
