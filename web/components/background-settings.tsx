"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Slider } from "@heroui/slider";
import { Image } from "@heroui/image";
import { useTranslations } from "next-intl";

interface BackgroundSettingsProps {
  onBackgroundChange?: (background: string, transparency: number) => void;
}

const backgroundOptions = [
  { id: "bg_1", name: "bg1", file: "bg_1.jpg" },
  { id: "bg_2", name: "bg2", file: "bg_2.jpg" },
  { id: "bg_3", name: "bg3", file: "bg_3.jpg" },
  { id: "bg_4", name: "bg4", file: "bg_4.png" },
  { id: "bg_5", name: "bg5", file: "bg_5.jpg" },
  { id: "bg_6", name: "bg6", file: "bg_6.jpg" },
  { id: "bg_7", name: "bg7", file: "bg_7.jpg" },
  { id: "bg_8", name: "bg8", file: "bg_8.jpg" },
];

export default function BackgroundSettings({
  onBackgroundChange,
}: BackgroundSettingsProps) {
  const t = useTranslations("background");
  const tCommon = useTranslations("common");

  const [selectedBackground, setSelectedBackground] = useState("bg_1");
  const [transparency, setTransparency] = useState(50);
  const [previewMode, setPreviewMode] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedBackground = localStorage.getItem("selectedBackground");
    const savedTransparency = localStorage.getItem("backgroundTransparency");

    if (savedBackground) {
      setSelectedBackground(savedBackground);
    }
    if (savedTransparency) {
      setTransparency(parseInt(savedTransparency));
    }
  }, []);

  // Apply background to body when settings change
  useEffect(() => {
    if (previewMode || !previewMode) {
      applyBackground();
    }
  }, [selectedBackground, transparency, previewMode]);

  const applyBackground = () => {
    const body = document.body;
    const backgroundImage = `/background/${backgroundOptions.find((bg) => bg.id === selectedBackground)?.file}`;
    const opacity = (100 - transparency) / 100;

    body.style.backgroundImage = `url(${backgroundImage})`;
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundAttachment = "fixed";

    // Create or update overlay for transparency
    let overlay = document.getElementById("background-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "background-overlay";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
      overlay.style.zIndex = "-1";
      overlay.style.pointerEvents = "none";
      document.body.appendChild(overlay);
    }

    overlay.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
  };

  const handleBackgroundSelect = (backgroundId: string) => {
    setSelectedBackground(backgroundId);
    if (onBackgroundChange) {
      const backgroundFile =
        backgroundOptions.find((bg) => bg.id === backgroundId)?.file || "";
      onBackgroundChange(backgroundFile, transparency);
    }
  };

  const handleTransparencyChange = (value: number | number[]) => {
    const newTransparency = Array.isArray(value) ? value[0] : value;
    setTransparency(newTransparency);
    if (onBackgroundChange) {
      const backgroundFile =
        backgroundOptions.find((bg) => bg.id === selectedBackground)?.file ||
        "";
      onBackgroundChange(backgroundFile, newTransparency);
    }
  };

  const handleSave = () => {
    localStorage.setItem("selectedBackground", selectedBackground);
    localStorage.setItem("backgroundTransparency", transparency.toString());
    setPreviewMode(false);
  };

  const handleCancel = () => {
    const savedBackground =
      localStorage.getItem("selectedBackground") || "bg_1";
    const savedTransparency = parseInt(
      localStorage.getItem("backgroundTransparency") || "50"
    );
    setSelectedBackground(savedBackground);
    setTransparency(savedTransparency);
    setPreviewMode(false);
  };

  const handlePreview = () => {
    setPreviewMode(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="text-sm text-default-500">{t("description")}</p>
        </div>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Background Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("selectBackground")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {backgroundOptions.map((option) => (
              <div
                key={option.id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedBackground === option.id
                    ? "border-primary shadow-lg"
                    : "border-default-200 hover:border-default-300"
                }`}
                onClick={() => handleBackgroundSelect(option.id)}
              >
                <Image
                  src={`/background/${option.file}`}
                  alt={t(`backgroundOptions.${option.name}`)}
                  className="w-full h-24 object-cover"
                  classNames={{
                    wrapper: "w-full h-24",
                  }}
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                    {t(`backgroundOptions.${option.name}`)}
                  </span>
                </div>
                {selectedBackground === option.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Transparency Control */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{tCommon("transparency")}</h3>
            <p className="text-sm text-default-500">
              {t("transparencyDescription")}
            </p>
          </div>
          <div className="space-y-2">
            <Slider
              aria-label="Transparency"
              step={1}
              color="primary"
              showSteps={false}
              showOutline={false}
              disableThumbScale={true}
              hideThumb={false}
              hideValue={false}
              value={transparency}
              onChange={handleTransparencyChange}
              className="max-w-md"
            />
            <div className="text-sm text-default-500">
              {t("transparencyLabel", { value: transparency })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="bordered" onClick={handleCancel}>
            {tCommon("cancel")}
          </Button>
          <Button variant="bordered" onClick={handlePreview}>
            {tCommon("preview")}
          </Button>
          <Button color="primary" onClick={handleSave}>
            {tCommon("save")}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
