import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Nav from '../components/nav.jsx'
import { useState, useEffect } from 'react'
import * as fcl from '@onflow/fcl'

export default function Home() {
  const [newGreeting, setNewGreeting] = useState('')
  const [greeting, setGreeting] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [number, setNumber] = useState('')
  const [txStatus, setTxStatus] = useState('Run Transaction')

  async function runTransaction() {
    const transactionId = await fcl.mutate({
      cadence: `
      import HelloWorld from 0xc0cc376c9b7faec3 // THIS WAS MY ADDRESS, USE YOURS
  
      transaction(myNewGreeting: String) {
  
        prepare(signer: AuthAccount) {}
  
        execute {
          HelloWorld.changeGreeting(newGreeting: myNewGreeting)
        }
      }
      `,
      args: (arg, t) => [arg(newGreeting, t.String)],
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999,
    })

    console.log('Here is the transactionId: ' + transactionId)

    fcl.tx(transactionId).subscribe((res) => {
      console.log(res)
      if (res.status === 0 || res.status === 1) {
        setTxStatus('Pending...')
      } else if (res.status === 2) {
        setTxStatus('Finalized...')
      } else if (res.status === 3) {
        setTxStatus('Executed...')
      } else if (res.status === 4) {
        setTxStatus('Sealed!')
        setTimeout(() => setTxStatus('Run Transaction'), 2000)
      }
    })

    await fcl.tx(transactionId).onceSealed()
    executeScript()
  }

  async function changeNumber() {
    const transactionId = await fcl.mutate({
      cadence: `
      import SimpleTest from 0x6c0d53c676256e8c 
  
      transaction(myNewNumber: Int) {
  
        prepare(signer: AuthAccount) {}
  
        execute {
          SimpleTest.updateNumber(newNumber: myNewNumber)
        }
      }
      `,
      args: (arg, t) => [arg(newNumber, t.Int)],
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999,
    })

    console.log('Here is the transactionId: ' + transactionId)
    await fcl.tx(transactionId).onceSealed()
    executeScriptNum()
  }

  async function executeScript() {
    const response = await fcl.query({
      cadence: `
      import HelloWorld from 0xc0cc376c9b7faec3

      pub fun main(): String {
          return HelloWorld.greeting
      }
      `, // CADENCE CODE GOES IN THESE ``
      args: (arg, t) => [], // ARGUMENTS GO IN HERE
    })

    console.log('Response from our script: ' + response)
    setGreeting(response)
  }

  async function executeScriptNum() {
    const response = await fcl.query({
      cadence: `
      import SimpleTest from 0x6c0d53c676256e8c

      pub fun main(): Int {
          return SimpleTest.number
      }
      `, // CADENCE CODE GOES IN THESE ``
      args: (arg, t) => [], // ARGUMENTS GO IN HERE
    })

    setNumber(response)
  }

  async function executeScriptArgs() {
    const response = await fcl.query({
      cadence: `
      pub fun main(
        worlds2022: [String]
      ): [String] {
        return worlds2022
      }      
      `, // CADENCE CODE GOES IN THESE ``
      args: (arg, t) => [arg(['T1', 'RNG', 'GenG'], t.Array(t.String))], // ARGUMENTS GO IN HERE
    })

    console.log('worlds2022: ' + response)
  }

  useEffect(() => {
    executeScript()
    executeScriptNum()
    executeScriptArgs()
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Emerald DApp</title>
        <meta name="description" content="Created by Emerald Academy" />
        <link rel="icon" href="https://i.imgur.com/hvNtbgD.png" />
      </Head>

      <Nav />

      <div className={styles.welcome}>
        <h1 className={styles.title}>
          Welcome to my{' '}
          <a href="https://academy.ecdao.org" target="_blank">
            Emerald DApp!
          </a>
        </h1>
        <p>
          This is a DApp created by Jacob Tucker (<i>tsnakejake#8364</i>).
        </p>
      </div>

      <main className={styles.main}>
        <p>{greeting}</p>
        <div className={styles.flex}>
          <input
            onChange={(e) => setNewGreeting(e.target.value)}
            placeholder="Hello, Idiots!"
          />
          <button onClick={runTransaction}>{txStatus}</button>
        </div>
      </main>
    </div>
  )
}
