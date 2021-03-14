import isDef from './is-def'

export default (random) => {
    random = isDef(random) ? random : Math.random;
    return "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")";
}
