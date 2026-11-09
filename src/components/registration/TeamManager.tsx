
"use client";

import { useEffect, useState } from "react";

import ParticipantFields from "./ParticipantFields";
import CustomFields from "./CustomFields";
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";
import type {
  ParticipantInput,
  EventFormField,
  RegistrationAnswerInput,
} from "@/lib/api";

type TeamManagerProps = {
  teamName: string;
  onTeamNameChange: (value: string) => void;
  leader: ParticipantInput;
  onLeaderChange: (value: ParticipantInput) => void;
  members: ParticipantInput[];
  onMembersChange: (value: ParticipantInput[]) => void;
  fields: EventFormField[];
  answers: RegistrationAnswerInput[];
  onAnswersChange: (value: RegistrationAnswerInput[]) => void;
  minParticipants: number;
  maxParticipants: number;
  showValidationErrors: boolean;
};

const createEmptyParticipant = (): ParticipantInput => ({
  fullName: "",
  email: "",
  mobileNumber: "",
  gender: "",
  state: "",
  city: "",
  collegeName: "",
  department: "",
  degree: "",
});

const requiredParticipantFields: (keyof ParticipantInput)[] = [
  "fullName",
  "email",
  "mobileNumber",
  "state",
  "city",
  "collegeName",
  "department",
  "degree",
  "gender",
];

const isValueComplete = (value: unknown): boolean => {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.length > 0;
  return false;
};

export default function TeamManager({
  teamName,
  onTeamNameChange,
  leader,
  onLeaderChange,
  members,
  onMembersChange,
  fields,
  answers,
  onAnswersChange,
  minParticipants,
  maxParticipants,
  showValidationErrors,
}: TeamManagerProps) {
  const [activeMember, setActiveMember] = useState(0);

  const totalParticipants = members.length + 1;

  // Backend limits include the team leader.
  const minimumAdditionalMembers = Math.max(0, minParticipants - 1);
  const maximumAdditionalMembers = Math.max(0, maxParticipants - 1);

  useEffect(() => {
    if (activeMember >= members.length) {
      setActiveMember(Math.max(0, members.length - 1));
    }
  }, [members.length, activeMember]);

  const updateTeamSize = (requestedCount: number) => {
    const count = Math.min(
      maximumAdditionalMembers,
      Math.max(minimumAdditionalMembers, requestedCount),
    );

    if (count === members.length) return;

    if (count > members.length) {
      const additionalMembers = Array.from(
        { length: count - members.length },
        () => createEmptyParticipant(),
      );

      onMembersChange([...members, ...additionalMembers]);
      return;
    }

    // Remove custom answers belonging to removed participants.
    const newTotalParticipants = count + 1;

    onAnswersChange(
      answers.filter(
        (answer) =>
          answer.participantIndex === undefined ||
          answer.participantIndex < newTotalParticipants,
      ),
    );

    onMembersChange(members.slice(0, count));
  };

  const isMemberComplete = (index: number) => {
    const member = members[index];

    if (!member) return false;

    const participantComplete = requiredParticipantFields.every((field) => {
      const value = member[field];

      if (typeof value !== "string") return false;

      return value.trim().length > 0;
    });

    if (!participantComplete) return false;

    const requiredCustomFields = fields.filter(
      (field) =>
        field.scope === "participant" && field.isRequired,
    );

    const customFieldsComplete = requiredCustomFields.every((field) => {
      const answer = answers.find(
        (item) =>
          item.fieldId === field.id &&
          item.participantIndex === index + 1,
      );

      return answer !== undefined && isValueComplete(answer.answer);
    });

    return customFieldsComplete;
  };

  const completedMembers = members.filter((_, index) =>
    isMemberComplete(index),
  ).length;

  const activeMemberData = members[activeMember];

  return (
    <div className="team-manager">

      {/* Team information */}
      <section className="team-manager-section">
        <div className="registration-section-heading">
          <span className="registration-section-number">01</span>
          <div>
            <h2>Team Information</h2>
            <p>Set up your team before adding participants.</p>
          </div>
        </div>

        <div className="team-information-fields">
          <div className="team-name-field">
            <label htmlFor="teamName">
              Team Name <span className="required-star">*</span>
            </label>

            <input
              id="teamName"
              type="text"
              value={teamName}
              onChange={(e) => onTeamNameChange(e.target.value)}
              placeholder="Enter your team name"
              required
              minLength={2}
              maxLength={150}
            />
          </div>

          <div className="team-size-control">
            <div>
              <label htmlFor="additionalMembers">
                Additional Members
              </label>
              <p>Excluding the team leader</p>
            </div>

            <div className="team-counter">
             <button
  type="button"
  aria-label="Decrease additional members"
  disabled={members.length <= minimumAdditionalMembers}
  onClick={() => updateTeamSize(members.length - 1)}
>
  <Minus size={16} />
</button>

              <input
                id="additionalMembers"
                type="number"
                min={minimumAdditionalMembers}
                max={maximumAdditionalMembers}
                value={members.length}
                onChange={(e) => {
                  if (e.target.value === "") return;

                  const value = Number(e.target.value);

                  if (Number.isInteger(value)) {
                    updateTeamSize(value);
                  }
                }}
                aria-label="Number of additional members"
              />

              <button
  type="button"
  aria-label="Increase additional members"
  disabled={members.length >= maximumAdditionalMembers}
  onClick={() => updateTeamSize(members.length + 1)}
>
  <Plus size={16} />
</button>
            </div>
          </div>
        </div>

        <div className="team-size-hint">
          <span>1 Team Leader</span>
          <span>+</span>
          <span>{members.length} Additional Members</span>
          <span>=</span>
          <strong>{totalParticipants} Participants</strong>
        </div>
      </section>

      {/* Team leader */}
      <section className="team-manager-section">
        <div className="registration-section-heading">
          <span className="registration-section-number">02</span>
          <div>
            <h2>Team Leader</h2>
            <p>Enter the details of your team representative.</p>
          </div>
        </div>

        <div className="team-leader-card">
          <div className="team-role-label">
            <span className="team-role-dot" />
            TEAM LEADER
          </div>

          <ParticipantFields
            participant={leader}
            onChange={onLeaderChange}
            title="Leader Details"
            idPrefix="leader"
          />

          <CustomFields
            fields={fields}
            answers={answers}
            onChange={onAnswersChange}
            scope="participant"
            participantIndex={0}
            title="Additional Leader Details"
            showValidationErrors={showValidationErrors}
          />
        </div>
      </section>

      {/* Additional members */}
      {members.length > 0 && (
        <section className="team-manager-section">
          <div className="registration-section-heading">
            <span className="registration-section-number">03</span>
            <div>
              <h2>Team Members</h2>
              <p>
                Complete the details of each additional participant.
              </p>
            </div>
          </div>

          {/* Member progress */}
          <div className="team-member-progress">
            <div>
              <strong>
                {completedMembers} of {members.length}
              </strong>
              <span> members completed</span>
            </div>

            <div className="team-progress-track">
              <div
                className="team-progress-fill"
                style={{
                  width: `${(completedMembers / members.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Member tabs */}
          <div
            className="team-member-tabs"
            role="tablist"
            aria-label="Additional team members"
          >
            {members.map((_, index) => {
              const complete = isMemberComplete(index);
              const active = activeMember === index;

              return (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  id={`member-tab-${index}`}
                  aria-selected={active}
                  aria-controls="active-member-panel"
                  className={`team-member-tab ${
                    active ? "active" : ""
                  } ${complete ? "complete" : ""}`}
                  onClick={() => setActiveMember(index)}
                >
                  <span className="member-tab-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="member-tab-label">
                    Member {String(index + 1).padStart(2, "0")}
                  </span>

                {complete ? (
  <span className="member-tab-status">
    <CheckCircle2 size={15} />
  </span>
) : (
  <span className="member-tab-pending">
    <Circle size={8} />
  </span>
)}
                </button>
              );
            })}
          </div>

          {/* Active member form */}
          {activeMemberData && (
            <div
              className="team-member-form-panel"
              id="active-member-panel"
              role="tabpanel"
              aria-labelledby={`member-tab-${activeMember}`}
            >
              <div className="team-member-form-header">
                <div>
                  <span className="team-member-eyebrow">
                    PARTICIPANT {activeMember + 2} OF {totalParticipants}
                  </span>

                  <h3>
                    Member {String(activeMember + 1).padStart(2, "0")}
                  </h3>

                  <p>
                    Enter the details of this team member.
                  </p>
                </div>

                <span
                  className={`member-completion-status ${
                    isMemberComplete(activeMember) ? "complete" : ""
                  }`}
                >
                  {isMemberComplete(activeMember)
                    ? "✓ Completed"
                    : "Incomplete"}
                </span>
              </div>

              <ParticipantFields
                participant={activeMemberData}
                onChange={(updated) => {
                  const updatedMembers = [...members];
                  updatedMembers[activeMember] = updated;
                  onMembersChange(updatedMembers);
                }}
                title="Participant Details"
                idPrefix={`member-${activeMember + 1}`}
              />

              <CustomFields
                fields={fields}
                answers={answers}
                onChange={onAnswersChange}
                scope="participant"
                participantIndex={activeMember + 1}
                title="Additional Participant Details"
                showValidationErrors={showValidationErrors}
              />

              {/* Member navigation */}
              <div className="team-member-navigation">
               <button
  type="button"
  className="team-member-previous"
  disabled={activeMember === 0}
  onClick={() => setActiveMember((current) => current - 1)}
>
  <ChevronLeft size={15} />
  Previous
</button>

<span>
  {activeMember + 1} / {members.length}
</span>

<button
  type="button"
  className="team-member-next"
  disabled={activeMember === members.length - 1}
  onClick={() => setActiveMember((current) => current + 1)}
>
  Next Member
  <ChevronRight size={15} />
</button>
              </div>
            </div>
          )}
        </section>
      )}

      {members.length === 0 && (
        <div className="team-empty-state">
          <p>No additional members selected.</p>
          <span>
            Increase the additional member count above if your event
            requires a team.
          </span>
        </div>
      )}
    </div>
  );
}
