import React from 'react';

/**
 * Composant pour les options d'export et d'impression
 */
const ExportOptions = ({ 
  onExportJPEG, 
  onExportPDF, 
  etiquettesParPage, 
  setEtiquettesParPage 
}) => {
  return (
    <div className="flex flex-col gap-4 mb-4 w-full max-w-md">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onExportJPEG}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Afficher l'image
        </button>
        <button
          onClick={onExportPDF}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          PDF
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <label className="flex items-center">
          <span>Nombre d'étiquettes par page A4:</span>
          <input
            type="number"
            min="1"
            max="30"
            value={etiquettesParPage}
            onChange={(e) => setEtiquettesParPage(Number(e.target.value))}
            className="ml-2 p-1 border rounded w-16 text-center"
          />
        </label>
        <span className="text-xs text-gray-500">
          (pour l'export PDF uniquement)
        </span>
      </div>
    </div>
  );
};

export default ExportOptions;
