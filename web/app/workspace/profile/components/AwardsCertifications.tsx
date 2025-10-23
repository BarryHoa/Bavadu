"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Trophy } from "lucide-react";

interface Award {
  id: number;
  title: string;
  date: string;
}

export default function AwardsCertifications() {
  const [isAwardsModalOpen, setIsAwardsModalOpen] = useState(false);

  // Sample awards data
  const awards: Award[] = [
    { id: 1, title: "Best Developer Award", date: "March 2024" },
    { id: 2, title: "AWS Solutions Architect", date: "January 2024" },
    { id: 3, title: "Hackathon Winner 2023", date: "December 2023" },
    { id: 4, title: "Google Cloud Certified", date: "October 2023" },
    { id: 5, title: "Microsoft Azure Expert", date: "August 2023" },
  ];

  const maxDisplayedAwards = 3;
  const hasMoreAwards = awards.length > maxDisplayedAwards;
  const displayedAwards = awards.slice(0, maxDisplayedAwards);

  return (
    <>
      <Divider />

      {/* Awards & Certifications */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Awards & Certifications
          </h3>
          {hasMoreAwards && (
            <Button
              size="sm"
              variant="light"
              color="primary"
              onPress={() => setIsAwardsModalOpen(true)}
            >
              View More
            </Button>
          )}
        </div>

        {displayedAwards.map((award) => (
          <div key={award.id} className="p-2 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">
              {award.title}
            </h4>
            <p className="text-xs text-gray-500">{award.date}</p>
          </div>
        ))}
      </div>

      {/* Awards & Certifications Modal */}
      <Modal
        isOpen={isAwardsModalOpen}
        onClose={() => setIsAwardsModalOpen(false)}
        size="2xl"
        placement="center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2">
                <Trophy size={20} />
                All Awards & Certifications
              </ModalHeader>
              <ModalBody className="space-y-3">
                {awards.map((award) => (
                  <div
                    key={award.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-primary transition-colors"
                  >
                    <h4 className="text-base font-semibold text-gray-900">
                      {award.title}
                    </h4>
                    <p className="text-sm text-gray-500">{award.date}</p>
                  </div>
                ))}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
