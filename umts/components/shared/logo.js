import Link from 'next/link'

const Logo = ({ user }) => {
  return (
    <Link href="/">
      <a>
        <img
          width={`${user ? '236' : '305'}`}
          height={`${user ? '45' : '58'}`}
          src="/mts-online-logo.svg"
          alt="MTS-online | U-MTS"
        />
      </a>
    </Link>
  )
}

export default Logo
