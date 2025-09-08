import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import Img1 from '../../assets/imgs/2nd.png';
import Img2 from '../../assets/imgs/3rd.jpg';
import Img3 from '../../assets/imgs/4th.jpg';
import Img4 from '../../assets/imgs/5th.jpg';
import './aboutUs.css';

const AboutUs = () => {
    return (
        <>
            <div className="container col-xxl-8 px-4 py-5" id='about'>
                <div className="row flex-lg-row-reverse align-items-center g-5 py-5">
                    <div className="col-12 col-sm-10 col-lg-6 d-flex justify-content-center mx-auto">
                        <Carousel fade className="w-100">
                            <Carousel.Item>
                                <img src={Img1} className="d-block w-100 rounded" alt="Slide 1" />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img src={Img2} className="d-block w-100 rounded" alt="Slide 2" />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img src={Img3} className="d-block w-100 rounded" alt="Slide 3" />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img src={Img4} className="d-block w-100 rounded" alt="Slide 3" />
                            </Carousel.Item>
                        </Carousel>     
                    </div>
                    <div className="col-lg-6 text-center text-lg-start">
                        <h1 className="fs-2 fs-lg-1 fw-bold lh-1 mb-3">About Us</h1>
                        <p className="lead mb-4">
                            We believe your home should be a reflection of your unique style and a sanctuary of comfort.
                            We are dedicated to offering a curated collection of high-quality furniture...
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AboutUs;