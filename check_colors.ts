import { fetchFacets } from './src/services/cardsService.js';

(async () => {
    try {
        const facets = await fetchFacets();
        console.log('Colors:', facets.colores);
    } catch (e) {
        console.error(e);
    }
})();
