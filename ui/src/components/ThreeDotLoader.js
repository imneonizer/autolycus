import Loader from 'react-loader-spinner';

function ThreeDotLoader() {
    return (
        <div style={{position: "fixed", top: "50%", left: "50%", marginLeft: "-20px", marginTop: "-25px"}}>
            <Loader
            type="ThreeDots"
            color="#e0e0e0"
            height={50}
            width={50}        
            />
        </div>
    )
}

export default ThreeDotLoader;