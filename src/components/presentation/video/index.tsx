export default function Video() {
  return (
    <video id="video_id" title="Apresentação da bid" muted autoPlay loop playsInline preload="auto">
      <source src="/short_presentation.mp4" type="video/mp4" />
    </video>
  );
}
