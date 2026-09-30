import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { StoryMode } from './components/Story';
import { Header } from './components/Header';
import { ChapterRail } from './components/ChapterRail';
import { SourcesPanel } from './components/SourcesPanel';
import { Hero } from './sections/Hero';
import { Engineering } from './sections/Engineering';
import { Construction } from './sections/Construction';
import { Network } from './sections/Network';
import { Startup } from './sections/Startup';
import { Service } from './sections/Service';
import { Parts } from './sections/Parts';
import { Safety } from './sections/Safety';
import { Insulation } from './sections/Insulation';
import { Final } from './sections/Final';
import { timeline } from './animations/timeline';
import { totalLength } from './data/chapters';
import { device } from './utils/device';

const Experience = lazy(() => import('./scenes/Experience'));

export default function App() {
  const immersive = device.webgl;
  const [ready, setReady] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [markers, setMarkers] = useState(false);

  useEffect(() => {
    if (immersive) timeline.start();
  }, [immersive]);

  useEffect(() => {
    document.body.classList.toggle('show-sources', markers);
  }, [markers]);

  // Any [data-open-sources] link (the numbered markers on facts) opens the panel at its claim.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>('[data-open-sources]');
      if (!a) return;
      e.preventDefault();
      setFocusId(a.dataset.openSources ?? null);
      setSourcesOpen(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const openSources = useCallback(() => {
    setFocusId(null);
    setSourcesOpen(true);
  }, []);
  const closeSources = useCallback(() => setSourcesOpen(false), []);

  return (
    <StoryMode.Provider value={immersive ? 'immersive' : 'static'}>
      <div className={`app ${immersive ? 'is-immersive' : 'is-static'}`} data-ready={ready || !immersive}>
        {immersive && (
          <div className="canvas-wrap">
            <Suspense fallback={null}>
              <Experience onReady={() => setReady(true)} />
            </Suspense>
          </div>
        )}
        <div className="scrim" aria-hidden="true" />
        <Header onSources={openSources} />
        {immersive && <ChapterRail />}

        <main className="story" id="top">
          <Hero />
          <Engineering />
          <Construction />
          <Network />
          <Startup />
          <Service />
          <Parts />
          <Safety />
          <Insulation />
          <Final />
        </main>

        {immersive && <div className="scroll-spacer" style={{ height: `${(totalLength + 1) * 100}vh` }} aria-hidden="true" />}

        {immersive && (
          <div className="loader" aria-hidden={ready}>
            <span className="mono">Loading system</span>
            <span className="loader__bar" />
          </div>
        )}

        <SourcesPanel open={sourcesOpen} focusId={focusId} markers={markers} onMarkers={setMarkers} onClose={closeSources} />
      </div>
    </StoryMode.Provider>
  );
}
