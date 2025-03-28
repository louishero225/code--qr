import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { QRCodeCanvas } from "qrcode.react";

const Etiquette = ({ data, barcodeRef1, barcodeRef2 }) => {
  // Initialisation des codes-barres après le rendu
  useEffect(() => {
    if (barcodeRef1.current && barcodeRef2.current) {
      try {
        // Vérifier si l'IMEI1 est valide (non vide)
        if (data.imei1 && data.imei1.trim() !== "") {
          JsBarcode(barcodeRef1.current, data.imei1, {
            format: "CODE128",
            displayValue: false,
            width: 1.5,
            height: 30,
          });
        } else {
          // Si IMEI1 est vide, afficher un message ou une valeur par défaut
          barcodeRef1.current.innerHTML =
            "<text x='50' y='20' fill='gray'>Aucun IMEI spécifié</text>";
        }

        // Vérifier si l'IMEI2 est valide (non vide)
        if (data.imei2 && data.imei2.trim() !== "") {
          JsBarcode(barcodeRef2.current, data.imei2, {
            format: "CODE128",
            displayValue: false,
            width: 1.5,
            height: 30,
          });
        } else {
          // Si IMEI2 est vide, afficher un message ou une valeur par défaut
          barcodeRef2.current.innerHTML =
            "<text x='50' y='20' fill='gray'>Aucun IMEI spécifié</text>";
        }
      } catch (error) {
        console.error("Erreur lors de la génération des codes-barres:", error);
        // Gérer l'erreur pour éviter une page blanche
        if (barcodeRef1.current) {
          barcodeRef1.current.innerHTML =
            "<text x='50' y='20' fill='red'>Erreur de code-barre</text>";
        }
        if (barcodeRef2.current) {
          barcodeRef2.current.innerHTML =
            "<text x='50' y='20' fill='red'>Erreur de code-barre</text>";
        }
      }
    }
  }, [data.imei1, data.imei2, barcodeRef1, barcodeRef2]);

  // Valeur par défaut pour le QR code si IMEI1 est vide
  const qrValue =
    data.imei1 && data.imei1.trim() !== "" ? data.imei1 : "Aucun IMEI";

  return (
    <div className="border-2 p-4 flex gap-6 items-center etiquette">
      <div className="px-4 etiquette-info container-info">
        <h2 className="font-bold flex justify-between">
          <span>{data.model || "Modèle"}</span>{" "}
          <span>{data.color || "Couleur"}</span>
        </h2>

        <svg ref={barcodeRef1} className="w-full max-w-[200px] h-10 my-1"></svg>
        <p className="my-0">IMEI: {data.imei1 || "Non spécifié"}</p>
        <svg ref={barcodeRef2} className="w-full max-w-[200px] h-10 my-1"></svg>
        <p className="my-0">IMEI: {data.imei2 || "Non spécifié"}</p>
        <p className="mt-2">D/N: {data.serial || "Non spécifié"}</p>
      </div>
      <div className="flex flex-col items-center pr-4">
        <QRCodeCanvas value={qrValue} size={100} className="mt-2" />
        <div className="border rounded-full px-3 py-1 mt-2 font-bold">
          {data.labelA || "?"}
        </div>
      </div>
    </div>
  );
};

export default Etiquette;
