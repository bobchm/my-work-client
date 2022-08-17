export default function taskURL(suffix) {
    //    return "http://localhost:5000/" + suffix;
    var url = "https://bobs-my-work-server.herokuapp.com/" + suffix;
    console.log(url);
    return url;
}
