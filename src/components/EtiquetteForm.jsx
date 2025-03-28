import React from 'react';

/**
 * Composant de formulaire pour les informations de l'étiquette
 */
const EtiquetteForm = ({ formData, handleChange, validateImei }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4 w-full max-w-md">
      <label className="flex flex-col">
        <span>Modèle</span>
        <input
          type="text"
          name="model"
          value={formData.model}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </label>
      <label className="flex flex-col">
        <span>Couleur</span>
        <input
          type="text"
          name="color"
          value={formData.color}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </label>
      <label className="flex flex-col">
        <span>
          IMEI 1{" "}
          {!validateImei(formData.imei1) && formData.imei1 && (
            <span className="text-red-500 text-xs">
              (doit avoir 15 chiffres)
            </span>
          )}
        </span>
        <input
          type="text"
          name="imei1"
          value={formData.imei1}
          onChange={handleChange}
          className={`border p-2 rounded ${
            !validateImei(formData.imei1) && formData.imei1
              ? "border-red-500"
              : ""
          }`}
        />
      </label>
      <label className="flex flex-col">
        <span>
          IMEI 2{" "}
          {!validateImei(formData.imei2) && formData.imei2 && (
            <span className="text-red-500 text-xs">
              (doit avoir 15 chiffres)
            </span>
          )}
        </span>
        <input
          type="text"
          name="imei2"
          value={formData.imei2}
          onChange={handleChange}
          className={`border p-2 rounded ${
            !validateImei(formData.imei2) && formData.imei2
              ? "border-red-500"
              : ""
          }`}
        />
      </label>
      <label className="flex flex-col">
        <span>Numéro de série</span>
        <input
          type="text"
          name="serial"
          value={formData.serial}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </label>
      <div className="flex flex-col">
        <span>Étiquette</span>
        <div className="flex gap-2">
          <label className="flex items-center">
            <span>Label:</span>
            <input
              type="text"
              name="labelA"
              value={formData.labelA}
              onChange={handleChange}
              className="border p-2 rounded w-12 ml-1"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default EtiquetteForm;
