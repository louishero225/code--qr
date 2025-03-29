import React, { useState, useRef, useEffect } from "react";
import { toJpeg } from "html-to-image";
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
        
        // Ouvrir l'image dans un nouvel onglet du navigateur au lieu de la télécharger
        const newTab = window.open();
        newTab.document.write(`
          <html>
            <head>
              <title>Étiquette ${formData.model} - Export JPEG</title>
              <style>
                body { 
                  margin: 0; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  min-height: 100vh;
                  background-color: #f0f0f0;
                  flex-direction: column;
                  font-family: Arial, sans-serif;
                }
                img { 
                  max-width: 90%; 
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  border: 1px solid #ddd;
                }
                .footer {
                  margin-top: 20px;
                  font-size: 12px;
                  color: #666;
                }
                .buttons {
                  margin-top: 20px;
                }
                button {
                  padding: 8px 15px;
                  background: #4a90e2;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  margin: 0 5px;
                }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" alt="Étiquette ${formData.model}">
              <div class="footer">Conçu par Guillaume Koffi 0713402421</div>
              <div class="buttons">
                <button onclick="window.print()">Imprimer</button>
                <button onclick="downloadImage()">Télécharger</button>
              </div>
              <script>
                function downloadImage() {
                  const link = document.createElement('a');
                  link.download = 'etiquette-${formData.model}-${formData.imei1 || 'sans-imei'}.jpg';
                  link.href = '${dataUrl}';
                  link.click();
                }
              </script>
            </body>
          </html>
        `);
        newTab.document.close();
        
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
    toJpeg(etiquetteContainer, options)
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
                      pdf.addImage(dataUrl, 'JPEG', x, y, etiquetteWidth, etiquetteHeight);
                      
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
              
              console.log("PDF généré avec succès");
              
              // Générer le blob et l'URL pour l'affichage
              const pdfBlob = pdf.output('blob');
              const pdfUrl = URL.createObjectURL(pdfBlob);
              
              // Ouvrir le PDF dans un nouvel onglet
              const newTab = window.open(pdfUrl, '_blank');
              if (!newTab) {
                // Si le navigateur bloque l'ouverture d'un nouvel onglet, afficher un message
                alert("Le PDF a été généré, mais le navigateur a bloqué l'ouverture d'un nouvel onglet. Veuillez autoriser les pop-ups pour ce site.");
                
                // Alternative : proposer un lien de téléchargement direct
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `etiquettes-${formData.model}-${formData.imei1 || 'sans-imei'}.pdf`;
                link.click();
              }
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
        console.error('Erreur lors de l\'export en JPEG pour le PDF:', err);
        etiquetteContainer.classList.remove('export-ready');
      });
  };

  // Fonction pour valider l'IMEI (doit être un nombre et avoir 15 chiffres)
  const validateImei = (imei) => {
    return /^\d{15}$/.test(imei);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container-app flex flex-col min-h-screen">
      <header className="bg-primary py-4 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-center text-white text-2xl font-bold">Générateur d'étiquettes QR Code</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Formulaire */}
          <div className="flex-1">
            <EtiquetteForm 
              formData={formData} 
              onChange={handleInputChange}
              validateImei={validateImei}
            />
            
            {/* Options d'exportation */}
            <div className="mt-6">
              <h2 className="text-lg font-bold mb-2">Exporter</h2>
              <ExportOptions 
                onExportJPEG={handleExportJPEG}
                onExportPDF={handleExportPDF}
                etiquettesParPage={etiquettesParPage}
                setEtiquettesParPage={setEtiquettesParPage}
              />
            </div>
          </div>

          {/* Prévisualisation de l'étiquette */}
          <div className="p-4 mt-4 border" ref={etiquetteRef}>
            <Etiquette 
              data={formData}
              barcodeRef1={barcodeRef1A}
              barcodeRef2={barcodeRef2A}
            />
          </div>
        </div>
      </main>

      {/* Pied de page */}
      <Footer />
    </div>
  );
};

export default EtiquetteApp;
