
const Navbar = () => {
    return(
        <div>
        <nav className="flex justify-between items-center py-4 bg-transparent">
            <div className="text-white text-2xl font-bold p-3">
                <a href="/">Logo</a>
            </div>
            <div className='p-2'>
                <a href="/" className="text-white px-4 hover:text-gray-300">Home</a>
                <a href="/Marketplace" className="text-white px-4 hover:text-gray-300">Marketplace</a>
                <a href="/Publish" className="text-white px-4 hover:text-gray-300">Publish</a>
            </div>
        </nav>
        </div>
    )
}

export default Navbar;