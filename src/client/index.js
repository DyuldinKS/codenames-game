import { createBrowserHistory } from 'history';
import { Elm } from '../Main.elm';
import './styles.css';

const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
};

const app = Elm.Main.init({
  node: document.getElementById('elm-node'),
  flags: JSON.stringify({
    pathname: location.pathname,
    hasTouchScreen: isTouchDevice(),
  }),
});

const history = createBrowserHistory();

app.ports.urlSender.subscribe(url => {
  console.log('urlSender', url);
  history.push(url);
});

app.ports.copyGameUrlSender.subscribe(() => {
  navigator.clipboard.writeText(location.href);
});

app.ports.listenGameUpdates.subscribe(url => {
  console.log('listenGameUpdates', url);
  const evtSource = new EventSource(url);
  let openedWords = [];

  // message of opening new words
  evtSource.addEventListener('opened', msg => {
    openedWords = JSON.parse(msg.data);
    app.ports.openedWordsListener.send(openedWords);
  });

  evtSource.addEventListener('error', () => {
    // server fail? try to resubscribe?
  });
});

history.listen(({ location }) => {
  app.ports.urlChangeListener.send(location.pathname);
});
