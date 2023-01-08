import React from 'react';
import './Main.css'

class Main extends React.Component {
    constructor(props) {
        super(props)
        if(sessionStorage.getItem('user_id') === null)
        {
            window.location.href = '/Login'
        }
    }
    render() {
        return <>
            <div>{sessionStorage.getItem('user_id').username}님 환영합니다!</div>
        </>
    }
}

export default Main