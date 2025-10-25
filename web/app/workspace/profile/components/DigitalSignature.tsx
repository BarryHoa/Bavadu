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
import { Textarea } from "@heroui/input";
import { KeyRound, Shield, CheckCircle, Copy, RefreshCw } from "lucide-react";

export default function DigitalSignature() {
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [hasSignature, setHasSignature] = useState(true);
  const [copied, setCopied] = useState(false);

  // Sample signature data
  const signatureData = {
    publicKey:
      "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCozMxH2Mo4lgOEePzNm0tRgeLezV6ffAt0gunVTLw7onLRnrq0/IzW7yWR7QkrmBL7jTKEn5u+qKhbwKfBstIs+bMY2Zkp18gnTxKLxoS2tFczGkPLPgizskuemMghRniWaoLcyehkd3qqGElvW/VDL5AaWTg0nLVkjRo9z+40RQzuVaE8AkAFmxZzow3x+VJYKdjykkJ0iT9wCS0DRTXu269V264Vf/3jvredZiKRkgwlL9xNAwxXFg0x/XFw005UWVRIkdgcKWTjpBP2dPwVZ4WWC+9aGVd+Gyn1o0CLelf4rEjGoXbAAEgAqeGUxrcIlbjXfbcmwIDAQAB",
    signatureHash:
      "3a4f5b2c1d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a",
    createdAt: "2024-01-15",
    expiresAt: "2025-01-15",
    status: "active",
  };

  const handleCopyPublicKey = () => {
    navigator.clipboard.writeText(signatureData.publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateSignature = () => {
    // Logic để tạo lại chữ ký
    console.log("Regenerating signature...");
  };

  return (
    <>
      <Divider />

      {/* Digital Signature */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="text-primary" size={14} />
            Digital Signature
          </h3>
          <Button
            isIconOnly
            color="primary"
            size="sm"
            variant="light"
            onPress={() => setIsSignatureModalOpen(true)}
          >
            <KeyRound size={14} />
          </Button>
        </div>

        {hasSignature ? (
          <div className="p-2 rounded-lg border border-gray-200 bg-green-50">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="text-green-600" size={14} />
              <h4 className="text-sm font-semibold text-green-900">
                Signature Active
              </h4>
            </div>
            <p className="text-xs text-green-700">
              Valid until: {signatureData.expiresAt}
            </p>
          </div>
        ) : (
          <div className="p-2 rounded-lg border border-gray-200 bg-yellow-50">
            <h4 className="text-sm font-semibold text-yellow-900">
              No Signature
            </h4>
            <p className="text-xs text-yellow-700">
              Create a digital signature to verify your identity
            </p>
          </div>
        )}
      </div>

      {/* Digital Signature Modal */}
      <Modal
        isOpen={isSignatureModalOpen}
        placement="center"
        scrollBehavior="inside"
        size="2xl"
        onClose={() => setIsSignatureModalOpen(false)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2">
                <Shield size={20} />
                Digital Signature Management
              </ModalHeader>
              <ModalBody className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="text-green-600" size={20} />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900">
                      Signature Status: Active
                    </h4>
                    <p className="text-xs text-green-700">
                      Created: {signatureData.createdAt} | Expires:{" "}
                      {signatureData.expiresAt}
                    </p>
                  </div>
                </div>

                {/* Public Key */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Public Key</label>
                    <Button
                      color="primary"
                      size="sm"
                      startContent={<Copy size={14} />}
                      variant="light"
                      onPress={handleCopyPublicKey}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    classNames={{
                      input: "font-mono text-xs",
                    }}
                    maxRows={6}
                    minRows={4}
                    value={signatureData.publicKey}
                    variant="bordered"
                  />
                </div>

                {/* Signature Hash */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Signature Hash</label>
                  <Textarea
                    readOnly
                    classNames={{
                      input: "font-mono text-xs",
                    }}
                    minRows={2}
                    value={signatureData.signatureHash}
                    variant="bordered"
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    About Digital Signatures
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>
                      • Your digital signature uniquely identifies you in the
                      system
                    </li>
                    <li>
                      • Public key can be shared with others to verify your
                      identity
                    </li>
                    <li>• Private key is securely stored and never shared</li>
                    <li>
                      • Signatures expire after 1 year for security purposes
                    </li>
                  </ul>
                </div>

                {/* Regenerate Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> Regenerating your signature will
                    invalidate the current one. All previously signed documents
                    will need to be re-verified.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="warning"
                  startContent={<RefreshCw size={16} />}
                  variant="flat"
                  onPress={handleRegenerateSignature}
                >
                  Regenerate Signature
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
