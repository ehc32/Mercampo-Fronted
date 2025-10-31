import 'bootstrap-icons/font/bootstrap-icons.css';
import './Card.css';

interface Person {
    name: string;
    photo: string;
    role: string;

}

interface CarrouselLast12Props {
    person: Person;
    darkMode: boolean;
}

const Participant: React.FC<CarrouselLast12Props> = ({ person }) => {


    return (
        <div
            className='flex flex-column card-people'
        >
            <img src={person.photo} alt={person.name} />
            <div className='flex flex-column justify-center text-center'>
                <h4>{person.name}</h4>
                <p>{person.role}</p>
            </div>


        </div>
    );
};

export default Participant;
