import {
  html,
  component,
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'https://unpkg.com/haunted/haunted.js';
import { renderBoard } from './board.js';
import { staticStyles } from './styles.js';
import { IS_ADMIN, API_GAME_PATH } from './constants.js';

const isWordOpened = (idx, opened) => opened.has(idx) || IS_ADMIN;

const renderLoading = () => html`<div>Loading...</div>`;

const useGameState = initial => {
  const [game, setGame] = useState(initial);

  return [
    game,
    ({ teamWords, ...rest }) =>
      setGame({
        ...rest,
        teamWords: teamWords.map(ws => new Set(ws)),
      }),
  ];
};

const useOpenedWordsState = initial => {
  const [opened, setOpened] = useState(initial);
  return [
    opened,
    openedIds => {
      if (!opened || (openedIds && opened.size === openedIds.length)) {
        setOpened(new Set(openedIds));
      }
    },
  ];
};

// const useGameLoading = (setGame, setOpened) => {
//   useEffect(() => {
//     const controller = new AbortController();
//     fetch(API_GAME_PATH, { signal: controller.signal })
//       .then(res => res.json())
//       .then(({ opened, ...game }) => {
//         setGame(game);
//         setOpened(opened); // dynamic part of the game
//       });

//     return () => controller.abort();
//   }, []);
// };

const api = {
  createGame(settings, opts) {
    return fetch('/api/game', {
      method: 'POST',
      body: JSON.stringify(settings),
      ...opts,
    }).then(res => res.json());
  },
  getGame(id, opts) {
    return fetch(`/api/game/${id}`, opts).then(res => res.json());
  },
};

const useSubscriptionToGame = (id, setOpened) => {
  const evtSourceRef = useRef(null);
  console.log(evtSourceRef);

  useEffect(() => {
    if (!id) return;

    console.log('subscribe hook', id, evtSourceRef.current?.id, evtSourceRef.current?.id === id);
    if (evtSourceRef.current) {
      evtSourceRef.current.evtSource.close();
    }

    const evtSource = new EventSource(`${id}/subscribe`);
    evtSourceRef.current = { id, evtSource };

    // message of opening new words
    evtSource.addEventListener('opened', msg => {
      setOpened(JSON.parse(msg.data));
    });

    evtSource.addEventListener('error', () => {
      setOpened(null);
    });

    return () => evtSource.close();
  }, [id]);
};

const useWordOpeningHandler = (gameId, opened) => (e, idx) => {
  if (isWordOpened(idx, opened)) return;
  fetch(`${gameId}/open`, {
    method: 'POST',
    body: JSON.stringify({ idx }),
    headers: { 'Content-Type': 'application/json' },
  });
};

const history = History.createBrowserHistory();
window.h = history;

const useAbortController = () => useRef(new AbortController()).current;

// TODO: create utils.js
const ignoringAbortError = f => err => err.constructor.name !== 'AbortError' && f(err);
const tap = f => x => {
  f(x);
  return x;
};

const game = ({ match }) => {
  const id = match;
  // TODO: upgrade to SPA
  // const pathname = history.location;
  const [game, setGame] = useGameState(null);
  const [opened, setOpened] = useOpenedWordsState(null);
  console.log('RENDER', game?.id, opened?.size, history.location.pathname);
  // const isNewGame = pathname === '/';

  const controller = useAbortController();

  useEffect(() => {
    if (game && game.id === id) return;

    const handleLoadedGame = ({ opened, ...game }) => {
      console.log('game loaded', game, opened);
      setGame(game);
      setOpened(opened);
    };

    // setGame(null);
    // setOpened(null);

    // controller.abort();
    const requestOpts = { signal: controller.signal };

    console.log('use effect, create/load game', id);
    const requestGame = id ? api.getGame(id, requestOpts) : api.createGame({}, requestOpts);

    requestGame
      .then(tap(handleLoadedGame))
      .then(game => !id && history.push(`/${game.id}`))
      .catch(
        ignoringAbortError(() => {
          setGame(null);
        }),
      );

    return () => console.log('unmount') || controller.abort();
  }, [id, game]);

  useEffect(() => {
    console.log('MOUNT');
    return () => console.log('UNMOUNT');
  }, []);

  useEffect(() => {
    console.log('id update', id);
  }, [id]);

  // useGameLoading(setGame, setOpened);
  // useSubscriptionToGame(id, setOpened);

  return html`
    ${game && opened
      ? renderBoard(game, opened, useWordOpeningHandler(id, opened), isWordOpened)
      : renderLoading()}
    ${staticStyles}
  `;
};

// TODO: improve router, use children instead of calling routes
const router = (routes, props = {}) => {
  const [pathname, setPathname] = useState(history.location.pathname);

  useEffect(
    () =>
      history.listen((location, action) => {
        // location is an object like window.location
        console.log('history event', action, location.pathname, location.state);
        setPathname(location.pathname);
      }),
    [],
  );

  return useMemo(() => routes.map(r => r(pathname, props)), [pathname, props]);
};

const route = (template, renderer) => (pathname, props) => {
  const match = pathname.match(template);
  return match ? renderer({ ...props, match: match[1] }) : null;
};

// const redirect = (from, to) => (pathname, props) => {
//   if (pathname.match(from)) {
//     props.history.push('/');
//   }
//   return null;
// };

function App() {
  return router([route(/\/([\w\d]{5,12})?/, game)]);
}

customElements.define('codenames-app', component(App));
