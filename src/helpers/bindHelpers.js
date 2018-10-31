module.exports = () => {
    global.clj = (a) => {
        console.log(JSON.stringify(a, null, 2));
    }

    global.cl = (a) => {
        console.log(a);
    }
}