"use client";

import { useSettings } from "@/app/context/SettingsContext";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Slider } from "@heroui/slider";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect } from "react";

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

export default function BackgroundSetting({
  onBackgroundChange,
}: BackgroundSettingsProps) {
  const t = useTranslations("background");
  const tCommon = useTranslations("common");

  const {
    selectedBackground,
    setSelectedBackground,
    backgroundTransparency,
    setBackgroundTransparency,
    glassOpacity,
    setGlassOpacity,
  } = useSettings();

  // Apply background to body when settings change
  useEffect(() => {
    applyBackground();
  }, [selectedBackground, backgroundTransparency]);

  const applyBackground = () => {
    const body = document.body;
    const backgroundImage = `/background/${backgroundOptions.find((bg) => bg.id === selectedBackground)?.file}`;
    const opacity = (100 - backgroundTransparency) / 100;

    body.style.backgroundImage = `url(${backgroundImage})`;
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundAttachment = "fixed";

    // Create or update overlay for transparency
    let overlay = document.getElementById("workspace-layout");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "workspace-layout";
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
      onBackgroundChange(backgroundFile, backgroundTransparency);
    }
  };

  const handleTransparencyChange = (value: number | number[]) => {
    const newTransparency = Array.isArray(value) ? value[0] : value;
    setBackgroundTransparency(newTransparency);
    if (onBackgroundChange) {
      const backgroundFile =
        backgroundOptions.find((bg) => bg.id === selectedBackground)?.file ||
        "";
      onBackgroundChange(backgroundFile, newTransparency);
    }
  };

  const handleGlassOpacityChange = (value: number | number[]) => {
    const newOpacity = Array.isArray(value) ? value[0] : value;
    setGlassOpacity(newOpacity);
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
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all group ${
                  selectedBackground === option.id
                    ? "border-primary shadow-lg"
                    : "border-default-200 hover:border-default-300"
                }`}
                onClick={() => handleBackgroundSelect(option.id)}
              >
                <div className="relative w-full h-24 overflow-hidden">
                  <Image
                    src={`/background/${option.file}`}
                    alt={t(`backgroundOptions.${option.name}`)}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                    quality={75}
                    priority={selectedBackground === option.id}
                  />
                </div>

                {selectedBackground === option.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center z-10 border-1 border-white">
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
              value={backgroundTransparency}
              onChange={handleTransparencyChange}
              className="max-w-md"
            />
            <div className="text-sm text-default-500">
              {t("transparencyLabel", { value: backgroundTransparency })}
            </div>
          </div>
        </div>

        {/* Glass Effect Control */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{t("glassEffect")}</h3>
            <p className="text-sm text-default-500">
              {t("glassEffectDescription")}
            </p>
          </div>
          <div className="space-y-2">
            <Slider
              aria-label="Glass Opacity"
              step={1}
              minValue={0}
              maxValue={100}
              color="secondary"
              showSteps={false}
              showOutline={false}
              disableThumbScale={true}
              hideThumb={false}
              hideValue={false}
              value={glassOpacity}
              onChange={handleGlassOpacityChange}
              className="max-w-md"
            />
            <div className="text-sm text-default-500">
              {t("glassOpacityLabel", { value: glassOpacity })}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
