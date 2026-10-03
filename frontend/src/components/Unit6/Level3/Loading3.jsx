export default function LoadingScreen({
    loadingIdx,
    LOADING_LINES,
}) {
    return (
        <div className="sm-screen">
            <div className="sm-loading-wrap">
                <div className="sm-loading-glyph" />
                <p className="sm-loading-text">
                    {LOADING_LINES[loadingIdx]}
                </p>
            </div>
        </div>
    );
}