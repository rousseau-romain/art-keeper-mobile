import { origin, requestHeaders } from "expo-server";

/**
 * L'origin de la requête (schéma + hôte), corrigé pour un déploiement derrière un
 * reverse-proxy qui termine le TLS (Traefik/Dokploy en staging).
 *
 * `origin()` d'expo-server prend l'hôte du header `Host` (juste) mais déduit le
 * schéma de la socket qui arrive au process Node — et derrière un proxy qui parle
 * en clair au conteneur, cette socket n'est pas chiffrée, donc `origin()` renvoie
 * `http://…` alors que le visiteur est en HTTPS. Le canonical/og:url sortaient
 * ainsi en `http://`, que l'auditeur SEO signale comme "canonicalised" (l'URL
 * crawlée en `https` ne correspond pas au canonical déclaré en `http`).
 *
 * expo-server ignore délibérément les headers entrants pour son schéma ; on lit
 * donc `X-Forwarded-Proto` (posé par le proxy) et on l'applique par-dessus. En
 * local (pas de proxy, pas de header) on retombe sur `origin()` inchangé, ce qui
 * garde le self-canonical dynamique voulu par la règle seo-generate-metadata :
 * staging, prod et previews se canonicalisent chacun sur eux-mêmes.
 *
 * Server-only, comme `origin()` : à n'appeler que dans un `generateMetadata` /
 * `loader`, jamais au scope module ni dans un composant.
 */
export const requestOrigin = (): string => {
  const raw = origin();
  if (!raw) return "";
  const url = new URL(raw);
  const forwardedProto = requestHeaders().get("x-forwarded-proto");
  // Peut être une liste ("https, http") si plusieurs proxys — le premier est le
  // schéma vu par le client.
  if (forwardedProto) url.protocol = forwardedProto.split(",")[0].trim();
  return url.origin;
};
