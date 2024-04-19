const express = require('express');
path = require('path'),
    fs = require('fs'),
    app = express(),
    zipFolder = require('zip-folder'),
    port = (process.env.PORT || process.env.ALWAYSDATA_HTTPD_PORT || 3000),
    ip = (process.env.IP || process.env.ALWAYSDATA_HTTPD_IP);



// Chemin du dossier contenant les plugins
const pluginsDir = path.join(__dirname, 'plugins');

// Point de terminaison pour télécharger un dossier spécifique
app.get('/download/:folderName', (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(pluginsDir, folderName);
    const zipFilePath = path.join(__dirname, `${folderName}.zip`);

    // Vérifier si le dossier existe
    if (!fs.existsSync(folderPath)) {
        return res.status(404).send('Dossier introuvable');
    }

    // Créer l'archive ZIP à partir du dossier spécifié
    zipFolder(folderPath, zipFilePath, (err) => {
        if (err) {
            console.error('Erreur lors de la création de l\'archive ZIP :', err);
            return res.status(500).send('Erreur lors de la création de l\'archive ZIP');
        }

        // Télécharger l'archive ZIP
        res.download(zipFilePath, `${folderName}.zip`, (err) => {
            if (err) {
                console.error('Erreur lors du téléchargement de l\'archive ZIP :', err);
                return res.status(500).send('Erreur lors du téléchargement de l\'archive ZIP');
            }

            // Supprimer l'archive ZIP après le téléchargement
            fs.unlink(zipFilePath, (err) => {
                if (err) {
                    console.error('Erreur lors de la suppression de l\'archive ZIP :', err);
                }
            });
        });
    });
});


// Route pour la liste des plugins
app.get('/list', (req, res) => {

    // Lire le contenu du dossier plugins
    fs.readdir(pluginsDir, (err, files) => {
        if (err) {
            console.error('Erreur lors de la lecture du dossier plugins :', err);
            return res.status(500).send('Erreur lors de la récupération de la liste des plugins');
        }

        // Filtrer les dossiers (plugins) seulement
        const plugins = files.filter(file => fs.statSync(path.join(pluginsDir, file)).isDirectory());

        // Envoyer la liste des plugins en tant que réponse JSON
        res.json({ plugins });
    });
});

server = app.listen(port, ip, err => {
    err ?
        console.log("Error in server setup") :
        console.log(`Worker ${process.pid} started\nServeur lancer sur: http://localhost:${port}`);

});