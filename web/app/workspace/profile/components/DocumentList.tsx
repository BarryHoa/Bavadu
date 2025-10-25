"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { FileText, Download } from "lucide-react";

interface Document {
  id: number;
  name: string;
  uploadDate: string;
  createdBy: string;
  fileUrl: string;
  fileSize: string;
}

export default function DocumentList() {
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Sample documents data (expanded to demonstrate pagination)
  const documents: Document[] = [
    {
      id: 1,
      name: "Employment Contract.pdf",
      uploadDate: "2024-03-15",
      createdBy: "HR Department",
      fileUrl: "/documents/contract.pdf",
      fileSize: "2.5 MB",
    },
    {
      id: 2,
      name: "Tax Certificate 2024.pdf",
      uploadDate: "2024-02-20",
      createdBy: "Finance Team",
      fileUrl: "/documents/tax-cert.pdf",
      fileSize: "1.2 MB",
    },
    {
      id: 3,
      name: "Training Completion.pdf",
      uploadDate: "2024-01-10",
      createdBy: "Training Dept",
      fileUrl: "/documents/training.pdf",
      fileSize: "850 KB",
    },
    {
      id: 4,
      name: "Insurance Policy.pdf",
      uploadDate: "2023-12-05",
      createdBy: "HR Department",
      fileUrl: "/documents/insurance.pdf",
      fileSize: "3.1 MB",
    },
    {
      id: 5,
      name: "Performance Review 2023.pdf",
      uploadDate: "2023-11-28",
      createdBy: "Manager",
      fileUrl: "/documents/review.pdf",
      fileSize: "1.8 MB",
    },
    {
      id: 6,
      name: "NDA Agreement.pdf",
      uploadDate: "2023-10-15",
      createdBy: "Legal Team",
      fileUrl: "/documents/nda.pdf",
      fileSize: "950 KB",
    },
    {
      id: 7,
      name: "Benefits Package 2024.pdf",
      uploadDate: "2023-09-20",
      createdBy: "HR Department",
      fileUrl: "/documents/benefits.pdf",
      fileSize: "2.1 MB",
    },
    {
      id: 8,
      name: "Security Clearance.pdf",
      uploadDate: "2023-08-10",
      createdBy: "Security Dept",
      fileUrl: "/documents/clearance.pdf",
      fileSize: "1.5 MB",
    },
    {
      id: 9,
      name: "Health Insurance Card.pdf",
      uploadDate: "2023-07-05",
      createdBy: "HR Department",
      fileUrl: "/documents/health.pdf",
      fileSize: "680 KB",
    },
    {
      id: 10,
      name: "Salary Statement Jan 2024.pdf",
      uploadDate: "2024-01-31",
      createdBy: "Finance Team",
      fileUrl: "/documents/salary-jan.pdf",
      fileSize: "540 KB",
    },
    {
      id: 11,
      name: "Salary Statement Feb 2024.pdf",
      uploadDate: "2024-02-28",
      createdBy: "Finance Team",
      fileUrl: "/documents/salary-feb.pdf",
      fileSize: "560 KB",
    },
    {
      id: 12,
      name: "Project Assignment Letter.pdf",
      uploadDate: "2023-06-15",
      createdBy: "Manager",
      fileUrl: "/documents/assignment.pdf",
      fileSize: "1.1 MB",
    },
    {
      id: 13,
      name: "Vacation Request Approval.pdf",
      uploadDate: "2023-05-20",
      createdBy: "HR Department",
      fileUrl: "/documents/vacation.pdf",
      fileSize: "420 KB",
    },
    {
      id: 14,
      name: "Company Handbook 2024.pdf",
      uploadDate: "2023-12-01",
      createdBy: "HR Department",
      fileUrl: "/documents/handbook.pdf",
      fileSize: "5.2 MB",
    },
    {
      id: 15,
      name: "IT Policy Agreement.pdf",
      uploadDate: "2023-04-10",
      createdBy: "IT Department",
      fileUrl: "/documents/it-policy.pdf",
      fileSize: "1.9 MB",
    },
  ];

  const rowsPerPage = 10;
  const pages = Math.ceil(documents.length / rowsPerPage);

  const items = documents.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleDownload = (doc: Document) => {
    // Simulate download
    console.log("Downloading:", doc.name);
    // In production, this would trigger actual file download
    // window.open(doc.fileUrl, '_blank');

    // For demo, show alert
    alert(`Downloading: ${doc.name}`);
  };

  return (
    <>
      <Button
        className="flex-1"
        color="primary"
        size="sm"
        startContent={<FileText size={16} />}
        variant="flat"
        onPress={() => setIsDocumentModalOpen(true)}
      >
        My Documents
      </Button>

      {/* Documents List Modal */}
      <Modal
        isOpen={isDocumentModalOpen}
        placement="center"
        size="3xl"
        onClose={() => setIsDocumentModalOpen(false)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2">
                <FileText size={20} />
                My Documents
              </ModalHeader>
              <ModalBody className="p-0">
                <div className="flex flex-col">
                  <div className="overflow-auto max-h-[500px]">
                    <Table
                      removeWrapper
                      aria-label="Documents table"
                      classNames={{
                        th: " sticky top-0 z-10 shadow-sm",
                      }}
                      selectionBehavior="replace"
                      selectionMode="single"
                    >
                      <TableHeader>
                        <TableColumn>DOCUMENT NAME</TableColumn>
                        <TableColumn>UPLOAD DATE</TableColumn>
                        <TableColumn>CREATED BY</TableColumn>
                        <TableColumn>SIZE</TableColumn>
                        <TableColumn>ACTION</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {items.map((doc) => (
                          <TableRow
                            key={doc.id}
                            className="cursor-pointer hover:bg-gray-50"
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="text-primary" size={16} />
                                <span className="font-medium">{doc.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {doc.uploadDate}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {doc.createdBy}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-500">
                                {doc.fileSize}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                isIconOnly
                                color="primary"
                                size="sm"
                                variant="light"
                                onPress={() => handleDownload(doc)}
                              >
                                <Download size={16} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex  justify-end px-4 py-2">
                    <Pagination
                      showControls
                      showShadow
                      color="primary"
                      page={page}
                      size="sm"
                      total={pages}
                      onChange={setPage}
                    />
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
