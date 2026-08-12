# Configuration Apple MapKit JS

## ⚠️ Important : Ajouter votre Token MapKit

### Option 1 : Configuration Rapide (Directement dans index.html)

1. Allez sur [Apple Developer Account](https://developer.apple.com/account/)
2. Dans la section **Certificates, Identifiers & Profiles** → **Keys**
3. Créez une nouvelle clé avec le service **MapKit JS**
4. Copiez votre token

5. **Ouvrez `index.html`** et remplacez ceci :
```html
<script 
  src="https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.core.js"
  crossorigin 
  async
  data-callback="initMapKit"
  data-libraries="map"
  data-token="IMPORTANT: ADD YOUR MAPKIT TOKEN HERE">
</script>
```

Par ceci (avec votre vrai token) :
```html
<script 
  src="https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.core.js"
  crossorigin 
  async
  data-callback="initMapKit"
  data-libraries="map"
  data-token="eyJh...votre_token_complet...">
</script>
```

### Option 2 : Variables d'Environnement (Recommandé pour la prod)

Pour ne pas exposer votre token en plaintext :

1. Créez un fichier `.env` à la root du projet :
```env
VITE_MAPKIT_TOKEN=eyJh...votre_token...
```

2. Modifiez `index.html` pour utiliser une variable :
```html
<script 
  src="https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.core.js"
  crossorigin 
  async
  data-callback="initMapKit"
  data-libraries="map"
  data-token="%VITE_MAPKIT_TOKEN%">
</script>
```

3. Créez un script de build qui remplace `%VITE_MAPKIT_TOKEN%` par la vraie valeur

## ✅ Vérifier que ça Fonctionne

1. Après avoir ajouté le token, relancez le dev server :
```bash
npm run dev
```

2. Ouvrez [http://localhost:5173](http://localhost:5173)

3. Vous devriez voir la **carte Apple Maps** avec les arrêts Grenoble

## 🗺️ Fonctionnalités Implémentées

✅ Apple Maps (MapKit JS)
✅ Marqueurs jaunes pour les arrêts
✅ Marqueur bleu pour l'arrêt sélectionné
✅ Sidebar animée en overlay
✅ Clic sur marqueur → affiche détails
✅ Support du dark mode
✅ Design responsive

## 🔗 Ressources
- [Apple MapKit JS API](https://developer.apple.com/documentation/mapkitjs)
- [Apple Developer Account](https://developer.apple.com/account/)
- [MTAG Grenoble API](https://data.mobilites-m.fr/donnees)

## 📝 Erreur Commune
Si vous voyez "MapKit token not configured", assurez-vous que :
- Votre token est entre les guillemets dans `data-token="..."`
- Le token commence par `eyJh` (format JWT)
- Vous avez redémarré le dev server après avoir changé index.html

