import R from "ramda";

export let log = (data) => {
    console.log(data);

    return data;
}

export let log2 = R.curry((message, data) => {
    console.log(message, data);

    return data;
})

export let stringify = (data) => {
    console.log(JSON.stringify(data));

    return data;
}