import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faGoogle, faInstagram, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faHome, faEnvelope, faPhone, faPrint } from '@fortawesome/free-solid-svg-icons';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer text-light pt-4">
            <div className="container text-center text-md-left">
                <div className="row">
                    <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
                        <h6 className="text-uppercase fw-bold">Company Name</h6>
                        <hr className="mb-4 mt-0 d-inline-block mx-auto" style={{ width: '60px' }} />
                        <p>Creating iOS and Mac apps since 2008. Small team working remotely from Texas, California, and Canada.</p>
                        <p><FontAwesomeIcon icon={faEnvelope} /> info@example.com</p>
                    </div>
                </div>
            </div>

            <div className="bg-dark text-light text-center p-3">
                <section className="social-icons">
                    <a href="#" className="text-light mx-2">
                        <FontAwesomeIcon icon={faFacebook} />
                    </a>
                    <a href="#" className="text-light mx-2">
                        <FontAwesomeIcon icon={faTwitter} />
                    </a>
                    <a href="#" className="text-light mx-2">
                        <FontAwesomeIcon icon={faGoogle} />
                    </a>
                    <a href="#" className="text-light mx-2">
                        <FontAwesomeIcon icon={faInstagram} />
                    </a>
                    <a href="#" className="text-light mx-2">
                        <FontAwesomeIcon icon={faLinkedin} />
                    </a>
                    <a href="#" className="text-light mx-2">
                        <FontAwesomeIcon icon={faGithub} />
                    </a>
                </section>
                <p className="mt-3">© 2024 Open Security Room. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
