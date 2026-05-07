import "./../style/banner_big.css"

function Banner_Big(props) {
    const bgStyle = props.image ? { backgroundImage: `url(${props.image})` } : {};
    return (
        <div className="banner_big" style={bgStyle}>
            <h1>{props.info}</h1>
        </div>
    );
}
export default Banner_Big;