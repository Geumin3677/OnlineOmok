import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Signup.css'
import axios from 'axios';


function Signup() {
    const [Username, setUsername] = useState('')
    const [ID, setID] = useState('')
    const [PW, setPW] = useState('')

    const Usernamechange = (e) => {
        setUsername(e.target.value)
    }

    const IDchange = (e) => {
        setID(e.target.value)
    }

    const PWchange = (e) => {
        setPW(e.target.value)
    }

    const onSignup = () => {
        axios.post('/api/user_inform/signup', null , {
            params: {
                'id': ID,
                'pw': PW,
                'Username' : Username
            }
        })
        .then(res => {
            sessionStorage.setItem('user_id', res.data)
            document.location.href = '/'
        })
    }

    if(sessionStorage.getItem('user_id') !== null)
    {
        document.location.href = '/'
    }

    return(
        <div className='LoginCxt'>
            <div className='cxt'>
                <div className='LoginText'>SignUp</div>
                <div className='SInputCxt'>
                    <div className='IDText'>Username</div>
                    <input type='text' className='IDInput' onChange={Usernamechange} ></input>
                    <div className='fucku'></div>
                    <div className='PWText'>ID</div>
                    <input type='text' className='PWInput' onChange={IDchange} ></input>
                    <div className='fuckup'></div>
                    <div className='PWText'>Password</div>
                    <input type='password' className='PWInput' onChange={PWchange} ></input>
                    <div className='fuckups'></div>
                    <button className='SubmitBt' onClick={onSignup}>SignUp</button>
                </div>
                <Link to='/Login'>
                    <div className='signupLink'>로그인 하러가기 →</div>
                </Link>
                
            </div>
        </div>
    )
}

export default Signup