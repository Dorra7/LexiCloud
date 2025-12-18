// Variables globales
let listeMotsVides = new Set();
let texteOriginal = ""; 

// Chargement des mots vides au démarrage
function chargerMotsVides() {
    // Charger le fichier
    fetch('mots-vides.txt')
        .then(response => response.text()) 
        .then(data => { //
            // Créer la liste des mots vides après la séparation par saut de ligne
            const tableauMots = data.split(/\r?\n/);

            // On convertit le tableau en Set
            listeMotsVides = new Set(tableauMots.map(m => m.trim().toLowerCase()));
        })  
        .catch(error => {
            console.error("Erreur lors du chargement des mots vides :", error);
        });
}
chargerMotsVides();

// Importer un fichier
document.getElementById('inputFichier').addEventListener('change', function(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;

    const lecteur = new FileReader();
    lecteur.onload = function(e) {
        // Remplir la zone de texte avec le contenu du fichier
        document.getElementById('zoneTexte').value = e.target.result;
        basculerModeEdition(true);
    };
    lecteur.readAsText(fichier);
});

// Traitement du texte
function nettoyerEtDecouper(texteBrut) {

    // Convertir le texte en minuscules
    let texte = texteBrut.toLowerCase();
    
    // Eliminer les caractères spéciaux et ponctuation
    const regexPonctuation = /[.,\/#!$%\^&\*;:{}=\-_`~()?'"«»\n\r\t]/g;
    texte = texte.replace(regexPonctuation, " ");

    // Découpage du texte en mots par espaces
    const mots = texte.split(/\s+/);

    // Filtrer les mots 
    return mots.filter(mot => {

        // On retire les mots trop courts
        if (mot.length <= 2) return false;

        // On retire les mots vides
        if (listeMotsVides.has(mot)) return false;

        // On retire les nombres purs
        if (!isNaN(mot)) return false;
        
        return true;
    });
}


// Fonction utilitaire pour basculer entre mode édition et lecture
function basculerModeEdition(activerEdition) {
    const zoneTexte = document.getElementById('zoneTexte');
    const zoneLecture = document.getElementById('zoneLecture');
    if (activerEdition) {
        zoneTexte.classList.remove('hidden');
        zoneLecture.classList.add('hidden');
        zoneTexte.focus(); 
    } else {
        zoneTexte.classList.add('hidden');
        zoneLecture.classList.remove('hidden');
    }
}

// Double-cliquer sur le texte permet de le modifier à nouveau
document.getElementById('zoneLecture').addEventListener('dblclick', function() {
    basculerModeEdition(true);
});


function compterOccurrences(listeMots) {
    const dictionnaire = {};
    
    listeMots.forEach(mot => {
        dictionnaire[mot] = (dictionnaire[mot] || 0) + 1;
    });

    // Conversion en tableau trié
    return Object.entries(dictionnaire).sort((a, b) => b[1] - a[1]);
}


// Affichage des statistiques
function afficherStatistiques(nbMotsTotal, nbMotsFiltres, listeFinale) {
    // Calculs
    const totalMots = nbMotsTotal;
    const motsUniques = listeFinale.length;
    
    // Par défaut, on affiche le mot le plus fréquent
    const topMot = listeFinale.length > 0 ? `${listeFinale[0][0]} (${listeFinale[0][1]})` : "-";

    document.getElementById('statTotal').innerText = totalMots;
    document.getElementById('statUnique').innerText = motsUniques;

    // On met à jour l'élément StatTop
    changerStatDynamique("Top mot :", topMot);

    // Rendre la barre visible
    document.getElementById('statsBar').classList.remove('hidden');
}

// Nouvelle fonction pour mettre à jour la partie dynamique (Clic ou Top mot)
function changerStatDynamique(label, valeur) {
    const element = document.getElementById('statTop');
    
    // Si l'élément n'existe pas, on sort
    if (!element) return; 

    // On cible le parent pour modifier l'affichage
    const parent = element.parentElement;
    
    // On modifie l'affichage
    parent.innerHTML = `${label} <strong>${valeur}</strong><span id="statTop" style="display:none;"></span>`;
}

function surlignerMot(motCible) {
    // On bascule en mode lecture pour voir le surlignage
    basculerModeEdition(false);

    const zoneLecture = document.getElementById('zoneLecture');
    const texteOriginal = document.getElementById('zoneTexte').value;

    // Si le texte est trop long on évite le surlignage 
    if (texteOriginal.length > 50000) {
        zoneLecture.innerText = texteOriginal;
        return;
    }

    // Remplacer les caractères spéciaux dans le mot cible pour le regex
    const motEchappe = motCible.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Regex avec \b pour mot entier, 'g' global, 'i' insensible à la casse
    const regex = new RegExp(`\\b(${motEchappe})\\b`, 'gi');

    // Remplacement par la balise <mark>
    const contenuSurligne = texteOriginal.replace(regex, '<mark>$1</mark>');
    
    // Injection du HTML 
    zoneLecture.innerHTML = contenuSurligne.replace(/\n/g, '<br>');

    // Scroll automatique vers la première occurrence
    const premierMark = zoneLecture.querySelector('mark');
    if (premierMark) {
        premierMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}



function genererNuage(listeFinale) {
    const canvas = document.getElementById('canvasNuage');
    const container = document.getElementById('canvas-container');

    // Nettoyage explicite du canvas 
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Adapter la taille du canvas 
   const largeur = container.offsetWidth;
    canvas.width = largeur;
    canvas.height = Math.max(500, largeur * 0.75);

    // Vérification de la liste
    if (listeFinale.length === 0) return;

    // Calcul du facteur de zoom automatique
    const maxFreq = listeFinale[0][1];
    const facteur = (canvas.width * 0.15) / maxFreq; 

    // Configuration WordCloud
    WordCloud(canvas, {
        list: listeFinale,
        backgroundColor: '#fffcf8', 
        
       // Taille des mots proportionnelle à la fréquence
        weightFactor: size => Math.min(Math.max(10, size * facteur), 100),
        
        fontFamily: 'Segoe UI, sans-serif',
    
        rotateRatio: 0.25,
        gridSize: 15, 
        drawOutOfBound: false,
        shrinkToFit: true,

        // Lors du clic sur un mot
        click: function(item) {
        if (item) {
            const motClique = item[0];
            const nbOccurrences = Math.max(1, Math.round(item[1]));            console.log("Clic sur :", motClique);
            
            // C'EST ICI QUE VOUS L'UTILISEZ :
            changerStatDynamique("Mot sélectionné :", `${motClique} (${nbOccurrences})`);
            
            // Lancer le surlignage dans le texte
            surlignerMot(motClique);
        }
    },
        
        // Change le curseur en main au survol
        hover: function(item, dimension, event) {
            canvas.style.cursor = item ? 'pointer' : 'default';
        }
    });
}


// Téléchargement de l'image
document.getElementById('btnDownload').addEventListener('click', function() {
    const canvas = document.getElementById('canvasNuage');
    // Créer un lien temporaire
    const lien = document.createElement('a');
    lien.download = 'mon-nuage-de-mots.png';
    // Convertir le canvas en image PNG
    lien.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    lien.click();
});



// Exécution du traitement 
document.getElementById('btnLancer').addEventListener('click', function() {
    const texte = document.getElementById('zoneTexte').value;

    if (!texte.trim()) {
        alert("Veuillez entrer du texte.");
        return;
    }

    // Reset interface 
    basculerModeEdition(true);
    document.getElementById('btnDownload').disabled = true;

    // Traitement du texte
    const nbMotsBruts = texte.trim().split(/\s+/).filter(m => m.length > 0).length;
    
    const motsNettoyes = nettoyerEtDecouper(texte);
    const nbMotsFiltres = motsNettoyes.length;
    
    // Compter les occurrences des mots nettoyés 
    const listeComplete = compterOccurrences(motsNettoyes);

    // On limite à 150 mots 
    const listePourNuage = listeComplete.slice(0, 150); 

    // AFFICHAGE
    afficherStatistiques(nbMotsBruts, nbMotsFiltres, listeComplete);
    
    // Génération du nuage avec un léger délai pour l'UI
    setTimeout(() => {
        genererNuage(listePourNuage);
        if (listeComplete.length > 0) {
            document.getElementById('btnDownload').disabled = false;
        }
    }, 50);
});