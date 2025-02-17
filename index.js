export default class Scope {
    constructor(port = 3000) {
        this.port = port;
    }

    async search(q) {
        return fetch(`http://localhost:${this.port}/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: q }),
        })
            .then((response) => response.json())
            .then((data) => {
                return data.results;
            })
            .catch((error) => {
                throw new Error("Cannot connect to server: " + error.message);
            });
    }
}