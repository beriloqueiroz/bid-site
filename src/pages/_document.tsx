import { Html, Head, Main, NextScript } from "next/document";
import crypto from "crypto";

import { v4 } from "uuid";
import GoogleAnalytics from "@/components/google/ga4Tag";

const hash = crypto.createHash("sha256");
hash.update(v4());
const generatedNonce = hash.digest("base64");

const defaultUrls = [
  "https://bid.log.br/*",
  "*.bid.log.br",
  "http://localhost:3000",
].join(" ");

const ContentSecurityPolicy = `
  default-src 'self' ${defaultUrls};
  script-src 'self' ${defaultUrls} http://www.google.com https://www.googletagmanager.com https://google-analytics.com 'nonce-${generatedNonce}' 'unsafe-eval';
  child-src 'self' ${defaultUrls};
  style-src 'self' ${defaultUrls} https://fonts.googleapis.com 'unsafe-inline';
  font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com ${defaultUrls};  
  connect-src 'self' ${defaultUrls} https://www.googletagmanager.com https://google-analytics.com https://*.google-analytics.com;
`;

export default function Document() {
  return (
    <Html lang='pt-BR'>
      <Head nonce={generatedNonce}>
        <meta
          httpEquiv='Content-Security-Policy'
          content={ContentSecurityPolicy}
        />
        <GoogleAnalytics nonce={generatedNonce} />
      </Head>
      <body>
        <Main />
        <NextScript nonce={generatedNonce} />
      </body>
    </Html>
  );
}
