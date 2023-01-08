import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css'
import axios from 'axios';


function Login() {
    const [ID, setID] = useState('')
    const [PW, setPW] = useState('')

    const IDchange = (e) => {
        setID(e.target.value)
    }

    const PWchange = (e) => {
        setPW(e.target.value)
    }

    const onLogin = () => {
        axios.post('/api/user_inform/login', null , {
            params: {
                'id': ID,
                'pw': PW
            }
        })
        .then(res => {
            const result = res.data.res
            if(result  === 0)
            {
                document.getElementsByClassName('fucku')[0].innerHTML = ''
                document.getElementsByClassName('fuckup')[0].innerHTML = ''
                document.getElementsByClassName('fucku')[0].innerHTML = '존재하지 않는 ID 입니다'
            }
            else if(result  === 1)
            {
                document.getElementsByClassName('fucku')[0].innerHTML = ''
                document.getElementsByClassName('fuckup')[0].innerHTML = ''
                document.getElementsByClassName('fuckup')[0].innerHTML = '잘못된 비밀번호 입니다.'
            }
            else if(result?.uid !== undefined)
            {
                sessionStorage.setItem('user_id', ID)
                document.location.href = '/'
            }
            else
            {
                alert('서버에 문제가 발생했습니다')
            }
        })
    }

    if(sessionStorage.getItem('user_id') !== null)
    {
        document.location.href = '/'
    }

    return(
        <div className='LoginCxt'>
            <div className='cxt'>
                <div className='LoginText'>Login</div>
                <div className='InputCxt'>
                    <div className='IDText'>ID</div>
                    <input type='text' className='IDInput' onChange={IDchange} ></input>
                    <div className='fucku'></div>
                    <div className='PWText'>Password</div>
                    <input type='password' className='PWInput' onChange={PWchange} ></input>
                    <div className='fuckup'></div>
                    <button className='SubmitBt' onClick={onLogin}>Login</button>
                </div>
                <Link to='/Signup'>
                    <div className='signupLink'>회원가입 하러가기 →</div>
                </Link>
                
            </div>
        </div>
    )
}

export default Login