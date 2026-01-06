import React from 'react';
import { createRoot } from 'react-dom/client';
import 'react-toastify/dist/ReactToastify.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './styles/styles.scss';

import App from './containers/App.jsx';
import IntlProviderWrapper from './hoc/IntlProviderWrapper.jsx';

import { Provider } from 'react-redux';
import reduxStore, { persistor } from './redux';
import { PersistGate } from 'redux-persist/integration/react';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Provider store={reduxStore}>
    <PersistGate loading={null} persistor={persistor}>
      <IntlProviderWrapper>
        <App persistor={persistor} />
      </IntlProviderWrapper>
    </PersistGate>
  </Provider>
);
