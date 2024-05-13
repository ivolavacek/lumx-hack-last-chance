import './LoginPage.css'
import { Link } from 'react-router-dom'
import { useRef, useState, useEffect, useContext } from 'react'
import axios from 'axios'
import ModeContext from '../switchButton/ModeContext'

function Login() {
    const { language } = useContext(ModeContext);

    const text = language === 'en' ? {
        loged: 'You are logged in!',
        dash: 'Dashboard',
        contract: 'Contract',
        title: 'Login',
        input: 'Email/Username',
        password: 'Password',
        button: 'Log In',
        register: 'Sign Up',
        account: "Need an account?",
    } : {
        loged: 'Você está logado!',
        dash: 'Dashboard',
        contract: 'Contrato',
        title: 'Login',
        input: 'Email/Nome de usuário',
        password: 'Senha',
        button: 'Entrar',
        register: 'Inscreva-se',
        account: 'Ainda não tem conta?',
    }

    const emailRef = useRef();
    const errRef = useRef();

    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        emailRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [email, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/authorize',
                JSON.stringify({ email, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });

            setEmail('');
            setPwd('');
            setSuccess(response);

        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Missing Email/User or Password');
            } else if (err.response?.status === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current.focus();
        }
    }

    return (
        <div class="login">
            {success ? (
                <section>
                    <p class="title-login">{text.loged}</p>
                    <div className="menu-container-login">
                        <Link to="/dash"><button className="button">{text.dash}</button></Link>
                        <Link to="/contract"><button className="button">{text.contract}</button></Link>
                    </div>
                </section>
            ) : (
                <section>
                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                    <p class="title-login">{text.title}</p>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="email">{text.input}:</label>
                        <input
                            type="text"
                            id="email"
                            ref={emailRef}
                            autoComplete="off"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                        />

                        <label htmlFor="password">{text.password}</label>
                        <input
                            type="password"
                            id="password"
                            onChange={(e) => setPwd(e.target.value)}
                            value={pwd}
                            required
                        />
                        <button>{text.button}</button>
                    </form>
                    <p>
                        {text.account}<br />
                        <span className="line">
                            <a href="#">{text.register}</a>
                        </span>
                    </p>
                </section>
                )
            }
        </div>
    )
}

export default Login;