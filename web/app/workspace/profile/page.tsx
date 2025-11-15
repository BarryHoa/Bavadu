"use client";

import DatePickerBase from "@base/client/components/DatePicker";
import { IBaseInput } from "@base/client/components";
import { IBaseSelect, SelectItem } from "@base/client/components";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Textarea } from "@heroui/input";
import { parseDate } from "@internationalized/date";
import {
  Briefcase,
  Camera,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Save,
  Twitter,
  User,
  UserCircle,
} from "lucide-react";

import AwardsCertifications from "./components/AwardsCertifications";
import ChangePasswordModal from "./components/ChangePasswordModal";
import DigitalSignature from "./components/DigitalSignature";
import DocumentList from "./components/DocumentList";
import UserRole from "./components/UserRole";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card - Left Side */}
        <Card className="lg:col-span-1">
          <CardBody className="p-6 relative">
            <UserRole color="primary" role="Super Admin" />

            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar
                  isBordered
                  className="w-32 h-32"
                  color="primary"
                  src="https://i.pravatar.cc/150?u=user"
                />
                <Button
                  isIconOnly
                  className="absolute bottom-0 right-0"
                  color="primary"
                  radius="full"
                  size="sm"
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
                <User className="mr-2" size={20} />
                Personal Information
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">First Name</label>
                  <IBaseInput
                    defaultValue="John"
                    placeholder="Enter first name"
                    startContent={<User className="text-gray-400" size={16} />}
                    variant="bordered"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <IBaseInput
                    defaultValue="Doe"
                    placeholder="Enter last name"
                    startContent={<User className="text-gray-400" size={16} />}
                    variant="bordered"
                  />
                </div>
              </div>

              {/* Nickname / Display Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Nickname / Display Name
                </label>
                <IBaseInput
                  defaultValue="JD"
                  placeholder="Enter nickname or display name"
                  startContent={
                    <UserCircle className="text-gray-400" size={16} />
                  }
                  variant="bordered"
                />
              </div>

              {/* Gender & Date of Birth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Gender</label>
                  <IBaseSelect
                    defaultSelectedKeys={["male"]}
                    placeholder="Select gender"
                    variant="bordered"
                  >
                    <SelectItem key="male">Male</SelectItem>
                    <SelectItem key="female">Female</SelectItem>
                    <SelectItem key="other">Other</SelectItem>
                    <SelectItem key="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </IBaseSelect>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <DatePickerBase
                    showMonthAndYearPickers
                    defaultValue={parseDate("1990-01-15")}
                    maxValue={parseDate(new Date().toISOString().split("T")[0])}
                    minValue={parseDate("1945-01-01")}
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <IBaseInput
                    defaultValue="john.doe@example.com"
                    placeholder="Enter email address"
                    startContent={<Mail className="text-gray-400" size={16} />}
                    type="email"
                    variant="bordered"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <IBaseInput
                    defaultValue="+1 (555) 123-4567"
                    placeholder="Enter phone number"
                    startContent={<Phone className="text-gray-400" size={16} />}
                    type="tel"
                    variant="bordered"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Address</label>
                <IBaseInput
                  defaultValue="123 Main Street, San Francisco, CA 94102"
                  placeholder="Enter full address"
                  startContent={<MapPin className="text-gray-400" size={16} />}
                  variant="bordered"
                />
              </div>

              {/* Job Title */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Job Title</label>
                <IBaseInput
                  defaultValue="Senior Developer"
                  placeholder="Enter job title"
                  startContent={
                    <Briefcase className="text-gray-400" size={16} />
                  }
                  variant="bordered"
                />
              </div>

              {/* Bio / Description */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Bio / Description</label>
                <Textarea
                  defaultValue="Passionate developer with 5+ years of experience in building web applications. Love coding and learning new technologies."
                  maxRows={8}
                  minRows={4}
                  placeholder="Tell us about yourself..."
                  variant="bordered"
                />
              </div>
            </CardBody>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center">
                <Globe className="mr-2" size={20} />
                Social Links
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Website</label>
                <IBaseInput
                  defaultValue="https://johndoe.com"
                  placeholder="https://yourwebsite.com"
                  startContent={<Globe className="text-gray-400" size={16} />}
                  type="url"
                  variant="bordered"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">GitHub</label>
                  <IBaseInput
                    defaultValue="github.com/johndoe"
                    placeholder="github.com/username"
                    startContent={
                      <Github className="text-gray-400" size={16} />
                    }
                    variant="bordered"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">LinkedIn</label>
                  <IBaseInput
                    defaultValue="linkedin.com/in/johndoe"
                    placeholder="linkedin.com/in/username"
                    startContent={
                      <Linkedin className="text-gray-400" size={16} />
                    }
                    variant="bordered"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Twitter</label>
                <IBaseInput
                  defaultValue="@johndoe"
                  placeholder="@username"
                  startContent={<Twitter className="text-gray-400" size={16} />}
                  variant="bordered"
                />
              </div>
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="bordered">Cancel</Button>
            <Button color="secondary">
              <Save className="mr-2" size={16} />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
