import React, {useContext, useState, useEffect, useRef} from 'react';
import firebase from '../firebase';
import { GlobalContext } from '../context/GlobalState';

function useIsMountedRef(){
    const isMountedRef = useRef(null);
    useEffect(() => {
      isMountedRef.current = true;
      return () => isMountedRef.current = false;
    });
    return isMountedRef;
}

const AcctList = () => {
    const [accounts, setAccounts] = useState([]);
    const isMountedRef = useIsMountedRef();

    useEffect(() =>{
        firebase.firestore().collection('accounts').where("author", "==", firebase.auth().currentUser.uid)
            .onSnapshot((snapshot)=>{
                const newAccount = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }))
                if(isMountedRef.current){
                    setAccounts(newAccount)
                }
            })
    }, [isMountedRef]);

    return accounts;
}

export const Accounts = () => {
    const accounts = AcctList();
    const {setAcc, setDisplay} = useContext(GlobalContext);

    return (
        <div className="accounts-container">
            <div className="sort">
                <h2>Accounts</h2>
                <div>
                    <label>Sort By:</label>{" "}
                    <select>
                        <option> Name (A - Z)</option>
                        <option> Name (Z - A)</option>
                        <option disabled>--------</option>
                        <option> Balance ($$$-$)</option>
                        <option> Balance ($-$$$)</option>
                    </select>
                </div>
            </div>
            {accounts.map((account) =>
                <div key={account.id} className="accounts" >  
                    <div id="account">
                        <div id="account-name" onClick = {() => {
                                setAcc(account.id);
                                setDisplay("Account");
                            }}>
                            {account.title}
                        </div>
                        <div id="account-value">
                            <span className={account.value <= 0 ? 'negative-balance' : 'positive-balance'}>${account.value}</span>
                        </div>
                    </div>
                    <div id="delete-account">
                        <button onClick = {() =>{
                            firebase.firestore().collection('accounts').doc(account.id).delete()}
                        }
                        className= "del-acc-btn">X</button>
                    </div>
                </div>
            )}
            <button className="addAccount" onClick={()=>
                setDisplay("addAccount")
            }>+</button> 
        </div>
    )
}