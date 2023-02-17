declare global {
  interface Window {
    gtag?: any;
  }
}
interface EventProps {
  action: string;
  params: any;
}

export const pageView = (url: string) => {
  window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
    page_path: url,
  });
};

export const event = ({ action, params }: EventProps) => {
  window.gtag('event', action, params);
};
