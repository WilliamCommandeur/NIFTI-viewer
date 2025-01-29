import { RenderingEngine, Enums, init as coreInit, imageLoader, volumeLoader, setVolumesForViewports } from '@cornerstonejs/core';
import { ViewportType } from '@cornerstonejs/core/enums';
import { init as niftiImageLoader, cornerstoneNiftiImageLoader, createNiftiImageIdsAndCacheMetadata } from '@cornerstonejs/nifti-volume-loader';

// Elements du DOM pour les différents vues
const content = document.getElementById('app');
const viewportGrid = document.createElement('div');
viewportGrid.style.display = 'flex';
viewportGrid.style.flexDirection = 'row';

// Création des éléments pour les vues Axiale et Sagittale
const element1 = document.createElement('div');
element1.style.width = '500px';
element1.style.height = '500px';
const element2 = document.createElement('div');
element2.style.width = '500px';
element2.style.height = '500px';

viewportGrid.appendChild(element1);
viewportGrid.appendChild(element2);
content.appendChild(viewportGrid);

// Fonction principale d'initialisation
async function run() {
  // Initialisation de CornerstoneJS
  await coreInit();
  await niftiImageLoader();

  // Enregistrement du chargeur NIFTI
  const niftiURL = 'https://ohif-assets.s3.us-east-2.amazonaws.com/nifti/CTACardio.nii.gz';
  imageLoader.registerImageLoader('nifti', cornerstoneNiftiImageLoader);

  // Récupération des ID d'images et mise en cache des métadonnées
  const imageIds = await createNiftiImageIdsAndCacheMetadata({
    url: niftiURL
  });

  // Initialisation du moteur de rendu
  const renderingEngineId = 'myRenderingEngine';
  const renderingEngine = new RenderingEngine(renderingEngineId);

  // Définition des vues Axiale et Sagittale
  const viewportId1 = 'CT_AXIAL';
  const viewportId2 = 'CT_SAGITTAL';

  const viewportInput = [
    {
      viewportId: viewportId1,
      element: element1,
      type: ViewportType.ORTHOGRAPHIC,
      defaultOptions: {
        orientation: Enums.OrientationAxis.AXIAL,
      },
    },
    {
      viewportId: viewportId2,
      element: element2,
      type: ViewportType.ORTHOGRAPHIC,
      defaultOptions: {
        orientation: Enums.OrientationAxis.SAGITTAL,
      },
    },
  ];

  // Application des vues à l'engin de rendu
  renderingEngine.setViewports(viewportInput);

  // Chargement du volume
  const volumeId = 'myVolume';
  const volume = await volumeLoader.createAndCacheVolume(volumeId, {
    imageIds,
  });

  await volume.load();

  // Associer les volumes aux vues correspondantes
  setVolumesForViewports(renderingEngine, [{ volumeId }], [viewportId1, viewportId2]);

  // Rendu des vues
  renderingEngine.renderViewports([viewportId1, viewportId2]);
}

// Lancer la fonction
run();