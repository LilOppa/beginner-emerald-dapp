import Worlds2022 from "../contracts/Worlds2022.cdc" // THIS IS NO LONGER CORRECT

transaction(myNewTeam: String) {

  prepare(signer: AuthAccount) {}

  execute {
    Worlds2022.changeTeam(newTeam: myNewTeam)
  }
}