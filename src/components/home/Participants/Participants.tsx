import Participant from '../ParticipantCard/Participant';
import './../Style.css'

interface People {
    name: string;
    photo: string;
    role: string;
}

interface ParticipantsProps {
    people: People[];
}

const Participants: React.FC<ParticipantsProps> = ({ people }) => {
    return (
        <div className='participants-container my-10 '>
            <div className='flex flex-col'>

                <h2 className='titulo-sala-compra-light'>Participantes del proyecto</h2>
                <h4 className="sub-titulo-sala-compra-light text-center mb-4">
                    En servicios tecnológicos, nos enorgullece contar con un equipo de trabajo excepcional<br /> comprometido con la excelencia y dedicado a brindar la mejor experiencia a nuestros clientes.
                </h4>
            </div>
            <div className='flex flex-row flex-wrap text-center justify-around'>
                {
                    people.map((person, index) => (
                        <Participant key={index} person={person} darkMode={false} className='participant-card' />
                    ))
                }
            </div>
        </div>
    )
}

export default Participants;