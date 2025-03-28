import React, { useState, useRef, useEffect } from "react";
import { toPng, toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import Etiquette from "./components/Etiquette";
import EtiquetteForm from "./components/EtiquetteForm";
import ExportOptions from "./components/ExportOptions";
import Footer from "./components/Footer";
import JsBarcode from "jsbarcode";
import { QRCodeCanvas } from "qrcode.react";
import "./App.css";

const EtiquetteApp = () => {
  const [formData, setFormData] = useState({
    model: "X6880",
    color: "SLEEK BLACK",
    imei1: "353618551165956",
    imei2: "353618551165964",
    serial: "NXN1",
    labelA: "A",
    labelB: "B",
  });

  // Références pour les codes-barres et l'étiquette
  const barcodeRef1A = useRef(null);
  const barcodeRef2A = useRef(null);
  const etiquetteRef = useRef(null);
  const exportContainerRef = useRef(null);

  // État pour le nombre d'étiquettes par page
  const [etiquettesParPage, setEtiquettesParPage] = useState(8);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fonction pour imprimer uniquement l'étiquette
  const handlePrint = () => {
    // On utilise le printable-area qui contient une copie de l'étiquette pour l'impression
    const printableArea = document.getElementById('printable-area');

    if (!printableArea) return;

    // Créer un iframe invisible pour l'impression
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    // Récupérer le document dans l'iframe
    const frameDoc = printFrame.contentDocument || printFrame.contentWindow.document;

    // Récupérer les styles de la page actuelle
    const stylesheets = Array.from(document.styleSheets);
    let cssText = '';
    stylesheets.forEach(sheet => {
      try {
        const cssRules = sheet.cssRules || sheet.rules;
        for (let i = 0; i < cssRules.length; i++) {
          cssText += cssRules[i].cssText + '\n';
        }
      } catch (err) {
        console.log('Erreur lors de l\'accès aux règles CSS: ', err);
      }
    });

    // Création du contenu à imprimer
    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impression d'étiquette</title>
          <style>
            ${cssText}
            @page {
              size: auto;
              margin: 0mm;
            }
            body {
              margin: 10mm;
              padding: 0;
              font-family: Arial, sans-serif;
              background: white;
            }
            .print-container {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              flex-direction: column;
              align-items: center;
            }
            .print-footer {
              margin-top: 20px;
              font-size: 10px;
              color: #666;
              text-align: center;
            }
            .print-hide {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printableArea.innerHTML}
            <div class="print-footer">
              Conçu par Guillaume Koffi 0713402421
            </div>
          </div>
        </body>
      </html>
    `);
    frameDoc.close();

    // Attendre que tout soit chargé, puis imprimer
    printFrame.onload = function() {
      try {
        // Appliquer les codes-barres
        if (frameDoc.querySelectorAll('svg').length > 0) {
          const barcodes = frameDoc.querySelectorAll('svg');

          // Simuler l'application des codes-barres aux SVG
          for (let i = 0; i < barcodes.length; i++) {
            try {
              if (i === 0 && formData.imei1 && formData.imei1.trim() !== "") {
                JsBarcode(barcodes[i], formData.imei1, {
                  format: "CODE128",
                  displayValue: false,
                  width: 1.5,
                  height: 30,
                });
              } else if (i === 1 && formData.imei2 && formData.imei2.trim() !== "") {
                JsBarcode(barcodes[i], formData.imei2, {
                  format: "CODE128",
                  displayValue: false,
                  width: 1.5,
                  height: 30,
                });
              } else {
                // Pour les SVG sans données valides
                barcodes[i].innerHTML = "<text x='50' y='20' fill='gray'>Aucun IMEI spécifié</text>";
              }
            } catch (error) {
              console.error("Erreur lors de la génération des codes-barres pour l'impression:", error);
              barcodes[i].innerHTML = "<text x='50' y='20' fill='red'>Erreur de code-barre</text>";
            }
          }
        }

        setTimeout(() => {
          // Imprimer et supprimer l'iframe
          printFrame.contentWindow.print();
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 100);
        }, 500);
      } catch (err) {
        console.error('Erreur lors de l\'impression:', err);
        document.body.removeChild(printFrame);
      }
    };
  };

  // Fonction pour exporter en PNG
  const handleExportPNG = () => {
    if (!etiquetteRef.current) return;
    
    console.log("Démarrage de l'export PNG");
    
    // Options pour améliorer la qualité et ajouter un fond blanc
    const options = {
      backgroundColor: '#ffffff',
      pixelRatio: 3,
      style: {
        margin: '0',
        padding: '0'
      }
    };
    
    // On capture directement l'étiquette visible
    // Note: on utilise le div contenant l'étiquette, pas le conteneur parent
    const etiquetteContainer = etiquetteRef.current.querySelector('.etiquette');
    
    if (!etiquetteContainer) {
      console.error("Étiquette non trouvée pour l'export");
      return;
    }
    
    // Ajouter temporairement une classe pour améliorer la visibilité
    etiquetteContainer.classList.add('export-ready');
    
    // Utiliser directement l'étiquette visible à l'écran
    toPng(etiquetteContainer, options)
      .then(dataUrl => {
        console.log("PNG généré avec succès");
        
        // Créer un lien et le cliquer directement
        const link = document.createElement('a');
        link.download = `etiquette-${formData.model}-${formData.imei1 || 'sans-imei'}.png`;
        link.href = dataUrl;
        link.click();
        
        // Nettoyer
        etiquetteContainer.classList.remove('export-ready');
      })
      .catch(err => {
        console.error('Erreur lors de l\'export en PNG:', err);
        etiquetteContainer.classList.remove('export-ready');
      });
  };

  // Fonction pour exporter en JPEG
  const handleExportJPEG = () => {
    if (!etiquetteRef.current) return;
    
    console.log("Démarrage de l'export JPEG");
    
    // Options pour améliorer la qualité et ajouter un fond blanc
    const options = {
      backgroundColor: '#ffffff',
      pixelRatio: 3,
      quality: 0.95,
      style: {
        margin: '0',
        padding: '0'
      }
    };
    
    // On capture directement l'étiquette visible
    // Note: on utilise le div contenant l'étiquette, pas le conteneur parent
    const etiquetteContainer = etiquetteRef.current.querySelector('.etiquette');
    
    if (!etiquetteContainer) {
      console.error("Étiquette non trouvée pour l'export");
      return;
    }
    
    // Ajouter temporairement une classe pour améliorer la visibilité
    etiquetteContainer.classList.add('export-ready');
    
    // Utiliser directement l'étiquette visible à l'écran
    toJpeg(etiquetteContainer, options)
      .then(dataUrl => {
        console.log("JPEG généré avec succès");
        
        // Créer un lien et le cliquer directement
        const link = document.createElement('a');
        link.download = `etiquette-${formData.model}-${formData.imei1 || 'sans-imei'}.jpg`;
        link.href = dataUrl;
        link.click();
        
        // Nettoyer
        etiquetteContainer.classList.remove('export-ready');
      })
      .catch(err => {
        console.error('Erreur lors de l\'export en JPEG:', err);
        etiquetteContainer.classList.remove('export-ready');
      });
  };

  // Fonction pour exporter en PDF avec plusieurs étiquettes par page
  const handleExportPDF = () => {
    if (!etiquetteRef.current) return;
    
    console.log("Démarrage de l'export PDF");
    
    // Options pour améliorer la qualité et ajouter un fond blanc
    const options = {
      backgroundColor: '#ffffff',
      pixelRatio: 3,
      style: {
        margin: '0',
        padding: '0'
      }
    };
    
    // On capture directement l'étiquette visible
    // Note: on utilise le div contenant l'étiquette, pas le conteneur parent
    const etiquetteContainer = etiquetteRef.current.querySelector('.etiquette');
    
    if (!etiquetteContainer) {
      console.error("Étiquette non trouvée pour l'export");
      return;
    }
    
    // Ajouter temporairement une classe pour améliorer la visibilité
    etiquetteContainer.classList.add('export-ready');
    
    // Utiliser directement l'étiquette visible à l'écran
    toPng(etiquetteContainer, options)
      .then(dataUrl => {
        console.log("Image pour PDF générée avec succès");
        
        try {
          // Créer le PDF au format A4
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });
          
          // Dimensions de la page A4 en mm
          const pageWidth = 210;
          const pageHeight = 297;
          
          // Ajouter des marges
          const marginX = 10;
          const marginY = 10;
          
          // Créer une image temporaire pour obtenir les dimensions
          const img = new Image();
          img.onload = () => {
            console.log("Image chargée pour le PDF, dimensions:", img.width, "x", img.height);
            
            try {
              // Calculer la hauteur et la largeur de l'étiquette
              const etiquetteWidth = 90; // 90mm de large
              const etiquetteHeight = (img.height / img.width) * etiquetteWidth;
              
              // Calculer combien d'étiquettes peuvent tenir sur la largeur et la hauteur
              const contentWidth = pageWidth - (2 * marginX);
              const contentHeight = pageHeight - (2 * marginY);
              const etiquettesPerRow = Math.floor(contentWidth / etiquetteWidth);
              const etiquettesPerColumn = Math.floor(contentHeight / etiquetteHeight);
              
              console.log("Disposition: " + etiquettesPerRow + " x " + etiquettesPerColumn + " étiquettes par page");
              
              // Calculer l'espacement entre les étiquettes
              const spacingX = (contentWidth - (etiquettesPerRow * etiquetteWidth)) / (etiquettesPerRow + 1);
              const spacingY = (contentHeight - (etiquettesPerColumn * etiquetteHeight)) / (etiquettesPerColumn + 1);
              
              // Nombre total d'étiquettes par page
              const etiquettesPerPage = etiquettesPerRow * etiquettesPerColumn;
              
              // Nombre de pages nécessaires
              const totalPages = Math.ceil(etiquettesParPage / etiquettesPerPage);
              console.log("Nombre de pages nécessaires:", totalPages);
              
              // Générer les pages avec les étiquettes
              let etiquetteCount = 0;
              
              for (let page = 0; page < totalPages; page++) {
                // Ajouter une nouvelle page si ce n'est pas la première page
                if (page > 0) {
                  pdf.addPage();
                }
                
                // Dessiner les étiquettes sur la page actuelle
                for (let row = 0; row < etiquettesPerColumn && etiquetteCount < etiquettesParPage; row++) {
                  for (let col = 0; col < etiquettesPerRow && etiquetteCount < etiquettesParPage; col++) {
                    // Calculer la position de l'étiquette
                    const x = marginX + (col * etiquetteWidth) + ((col + 1) * spacingX);
                    const y = marginY + (row * etiquetteHeight) + ((row + 1) * spacingY);
                    
                    try {
                      // Ajouter l'image au PDF
                      pdf.addImage(dataUrl, 'PNG', x, y, etiquetteWidth, etiquetteHeight);
                      
                      // Incrémenter le compteur d'étiquettes
                      etiquetteCount++;
                    } catch (error) {
                      console.error('Erreur lors de l\'ajout de l\'image au PDF:', error);
                    }
                  }
                }
              }
              
              // Ajouter le pied de page global en bas de la dernière page
              const footerText = 'Conçu par Guillaume Koffi 0713402421';
              pdf.setFontSize(8);
              pdf.setTextColor(100, 100, 100);
              pdf.text(footerText, pageWidth / 2, pageHeight - 5, { align: 'center' });
              
              console.log("PDF généré avec succès, téléchargement...");
              
              // Enregistrer le PDF directement
              pdf.save(`etiquettes-${formData.model}-${formData.imei1 || 'sans-imei'}.pdf`);
            } catch (error) {
              console.error('Erreur lors de la génération du PDF:', error);
            } finally {
              // Nettoyer
              etiquetteContainer.classList.remove('export-ready');
            }
          };
          
          // Déclencher le chargement de l'image
          img.src = dataUrl;
        } catch (error) {
          console.error('Erreur lors de la création du PDF:', error);
          etiquetteContainer.classList.remove('export-ready');
        }
      })
      .catch(err => {
        console.error('Erreur lors de l\'export en PNG pour le PDF:', err);
        etiquetteContainer.classList.remove('export-ready');
      });
  };

  // Fonction pour valider l'IMEI (doit être un nombre et avoir 15 chiffres)
  const validateImei = (imei) => {
    return /^\d{15}$/.test(imei);
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen">
      <h1 className="text-xl font-bold mb-4">Générateur d'étiquettes</h1>

      {/* Formulaire */}
      <EtiquetteForm 
        formData={formData} 
        handleChange={handleChange} 
        validateImei={validateImei}
      />

      {/* Options d'export */}
      <ExportOptions 
        onPrint={handlePrint}
        onExportPNG={handleExportPNG}
        onExportJPEG={handleExportJPEG}
        onExportPDF={handleExportPDF}
        etiquettesParPage={etiquettesParPage}
        setEtiquettesParPage={setEtiquettesParPage}
      />

      {/* Prévisualisation de l'étiquette */}
      <div className="p-4 mt-4 border" ref={etiquetteRef}>
        <Etiquette 
          data={formData}
          barcodeRef1={barcodeRef1A}
          barcodeRef2={barcodeRef2A}
        />
      </div>
      
      {/* Pied de page */}
      <Footer />
      
      {/* Conteneur pour l'export (masqué mais utilisé pour l'export d'image) */}
      <div id="export-container" className="hidden">
        <div ref={exportContainerRef} className="export-container">
          <Etiquette 
            data={formData}
            barcodeRef1={{current: document.createElement('svg')}}
            barcodeRef2={{current: document.createElement('svg')}}
          />
        </div>
      </div>
      
      {/* Zone invisible utilisée pour l'impression */}
      <div id="printable-area" className="hidden">
        <Etiquette
          data={formData}
          barcodeRef1={{current: document.createElement('svg')}}
          barcodeRef2={{current: document.createElement('svg')}}
        />
      </div>
    </div>
  );
};

export default EtiquetteApp;
