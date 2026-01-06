import React from 'react';
import HomeHeader from './HomeHeader/HomeHeader';
import Specialty from './Section/Speciatly/Specialty';
import About from './Section/About/About';
import HomeFooter from './HomeFooter/HomeFooter';
import HandBook from './Section/HandBook/HandBook';
import Clinic from './Section/Clinic/Clinic';
import OutStandingDoctor from './Section/OutStandingDoctor/OutStandingDoctor';
import './HomePage.scss';
import BookingChat from '../../components/BookingChat/BookingChat';
import ChatWidget from '../../components/ChatWidget/ChatWidget';

const HomePage = () => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
  };

  return (
    <div>
      <HomeHeader isShowBanner={true} />
      <OutStandingDoctor settings={settings} />
      <Specialty settings={settings} />
      <Clinic settings={settings} />
      <HandBook settings={settings} />
      <About />
      <HomeFooter />
      <BookingChat />
      <ChatWidget />
    </div>
  );
};

export default HomePage;
