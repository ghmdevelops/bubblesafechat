import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faGoogle, faInstagram, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faHome } from '@fortawesome/free-solid-svg-icons';
import './Footer.css';
import iconPage from './img/icon-page.png'

const Footer = () => {
    return (
        <footer className="footer text-light pt-4 mt-5 mb-4">
            <div className="container text-center text-md-left">
                <div className="row">
                    <div className="col-md-4 col-lg-4 col-xl-4 mx-auto mb-4">
                        <img style={{ width: '  110px' }} src={iconPage} alt='OpenSecurityRoom' />
                        <h6 className="text-uppercase fw-bold">Bubble Safe Chat</h6>
                        <p>Converse com segurança, controle com liberdade!</p>
                        <hr className="mb-4 mt-0 d-inline-block mx-auto" style={{ width: '60px' }} />
                        <p>
                            Estamos revolucionando a forma de se comunicar com soluções de chat ultrasseguras. Com uma equipe enxuta e altamente dedicada, trabalhando remotamente de diversas regiões do Brasil e do mundo, nossa missão é clara: colocar a inovação e a segurança no coração de cada interação, protegendo suas conversas e garantindo total privacidade.
                        </p>
                        <p className='mt-4'><FontAwesomeIcon icon={faEnvelope} /> Email: contato@bubblesafechat.com.br</p>
                    </div>

                    <div className="col-md-4 col-lg-4 col-xl-4 mx-auto mb-4 d-none">
                        <h6 className="text-uppercase fw-bold">Contact Us</h6>
                        <hr className="mb-4 mt-0 d-inline-block mx-auto" style={{ width: '60px' }} />
                        <p><FontAwesomeIcon icon={faHome} /> Address: 123 Main St, City, Country</p>
                        <p><FontAwesomeIcon icon={faPhone} /> Phone: +123 456 7890</p>
                    </div>
                </div>
            </div>

            <div className="text-light text-center p-3 mt-5">
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
                <p className="mt-3">© 2024 Bubble Safe Chat. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
