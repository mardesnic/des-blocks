import { HomeLink } from './components/HomeLink';
import { useEffect, useState } from 'react';

import { Board } from './components/Board';
import { Confetti } from './components/Confetti';
import { Icon } from './components/Icon';
import { NewGame, SettingsView } from './components/Menu';
import { pick, type Difficulty } from './lib/blocks';
import {
  initialStats,
  newGame,
  recordWin,
  withSlide,
  type Game,
  type Stats,
} from './lib/game';
import { STRINGS, detectLang } from './lib/i18n';
import { popMenu, pushMenu, useBackButton } from './lib/use-back-button';
import { useCheer } from './lib/use-cheer';
import { useLanguage, useSound } from './lib/use-shared-settings';
import { useStoredState } from './lib/use-stored-state';
import { useWakeLock } from './lib/use-wake-lock';

type View = 'play' | 'new' | 'settings';

export default function App() {
  // Keys are prefixed: other apps on the same GitHub Pages origin share
  // this storage.
  const [store, setStore] = useStoredState<{ game?: Game }>('blocks', {});
  const { game } = store;
  const [stats, setStats] = useStoredState<Stats>('blocks-stats', initialStats);
  const [view, setViewState] = useState<View>(game ? 'play' : 'new');
  // Menus open over the game, so the phone's Back button closes them.
  const setView = (next: View) => {
    if (next === 'play') popMenu();
    else pushMenu();
    setViewState(next);
  };
  useBackButton(() => {
    if (game) setViewState('play');
  });
  const [history, setHistory] = useState<Game[]>([]);
  const [celebrating, setCelebrating] = useState(false);
  useWakeLock();
  const [sound, setSound] = useSound();
  const cheer = useCheer(sound);

  const [language, setLanguage] = useLanguage();
  const lang = language === 'auto' ? detectLang() : language;
  const t = STRINGS[lang];
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.title;
  }, [lang, t]);

  const start = (difficulty: Difficulty) => {
    // The last level, if it was the same size, so the new one isn't alike.
    const previous =
      game?.level.difficulty === difficulty ? game.level : undefined;
    setStore({ game: newGame(pick(difficulty, Math.random, previous)) });
    setHistory([]);
    setView('play');
  };

  const onSlide = (k: number, to: number) => {
    if (!game) return;
    const next = withSlide(game, k, to);
    if (next === game) return;
    if (next.solved) {
      setStats(recordWin(stats, next));
      setCelebrating(true);
      cheer();
    }
    setHistory((h) => [...h, game]);
    setStore({ game: next });
  };

  const undo = () => {
    if (!game || game.solved || !history.length) return;
    setStore({ game: history.at(-1)! });
    setHistory((h) => h.slice(0, -1));
  };

  const clear = () => {
    if (!game || game.solved) return;
    setHistory((h) => [...h, game]);
    setStore({ game: newGame(game.level) });
  };

  return (
    <main className={view === 'play' && game ? 'app app--play' : 'app'}>
      <header className='header'>
        <div className='header__title'>
          <HomeLink label={t.allGames} />
          <h1>{t.title}</h1>
        </div>
        <div className='header__actions'>
          {view === 'play' ? (
            <>
              <button
                className='button button--small'
                onClick={() => setView('new')}
              >
                {t.newGame}
              </button>
              <button
                className='button button--small button--icon'
                onClick={() => setView('settings')}
                aria-label={t.settings}
              >
                <Icon name='settings' />
              </button>
            </>
          ) : (
            game && (
              <button
                className='button button--small'
                onClick={() => setView('play')}
              >
                {view === 'new' ? t.cancel : t.done}
              </button>
            )
          )}
        </div>
      </header>

      {view === 'new' && <NewGame onStart={start} t={t} />}
      {view === 'settings' && (
        <SettingsView
          language={language}
          setLanguage={setLanguage}
          sound={sound}
          setSound={setSound}
          stats={stats}
          t={t}
        />
      )}

      {view === 'play' && game && (
        <>
          <div className='stage'>
            <Board
              // A new level starts with no block mid-drag.
              key={game.level.board}
              level={game.level}
              positions={game.positions}
              out={game.solved}
              onSlide={onSlide}
              t={t}
            />
          </div>

          {game.solved ? (
            <section className='card solved'>
              <h2>{t.solved}</h2>
              <p className='muted'>{t.solvedIn(game.moves)}</p>
              <div className='solved__actions'>
                <button
                  className='button'
                  onClick={() => start(game.level.difficulty)}
                >
                  {t.next}
                </button>
                <button
                  className='button button--secondary'
                  onClick={() => setView('new')}
                >
                  {t.changeLevel}
                </button>
              </div>
            </section>
          ) : (
            <div className='bar'>
              <p className='goal'>
                {game.moves ? t.moves(game.moves) : t.goal}
              </p>
              <div className='tools'>
                <button
                  className='tool'
                  onClick={undo}
                  disabled={!history.length}
                  aria-label={t.undo}
                >
                  <Icon name='undo' />
                </button>
                <button
                  className='tool'
                  onClick={clear}
                  disabled={!game.moves}
                  aria-label={t.clear}
                >
                  <Icon name='clear' />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {view === 'settings' && (
        <footer className='footer'>
          <a href='/des-kids-games/'>{t.allGames}</a>
          <a href='https://github.com/mardesnic/des-blocks'>{t.source}</a>
          <span className='footer__version'>
            {t.version} {__VERSION__}
          </span>
        </footer>
      )}
      {celebrating && <Confetti onDone={() => setCelebrating(false)} />}
    </main>
  );
}
