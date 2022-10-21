 pub contract Worlds2022 {

    pub var team: String

    pub fun changeTeam(newTeam: String) {
        self.team = newTeam
    }

    init() {
        self.team = "T1"
    }
}
 