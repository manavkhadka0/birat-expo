"use client";
import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "../components/ui/animated-modal";

export function AnimatedModalDemo() {
  return (
    <div className="inline-block items-center justify-center overflow-scroll">
      <Modal>
        <ModalTrigger className="inline-block">
          <p className="text-blue-600 underline">terms and conditions</p>
        </ModalTrigger>
        <ModalBody>
          <ModalContent className="overflow-scroll">
            <div className="max-w-4xl mx-auto p-2 bg-white overflow-scroll text-sm">
              <h1 className="text-2xl font-bold text-center mb-6">
                Terms and Regulations
              </h1>
              <div className="space-y-4">
                <section>
                  <h2 className="font-bold">1. TERMS OF REFERENCE</h2>
                  <ol className="list-[upper-alpha] pl-5 space-y-2">
                    <li>
                      In these terms and regulations for participation, the term
                      &quot;Exhibitor&quot; shall include all employees, agents
                      of any individual company, partnership firm or
                      organization which have applied for space for the purpose
                      of exhibiting.
                    </li>
                    <li>
                      The term &quot;exhibition&quot; shall mean (BIRAT
                      EXPO-2025) Digital Koshi : Bridging Innovation and
                      Investment
                    </li>
                    <li>
                      The term &quot;organizer&quot; shall mean Chamber of
                      Industries Morang
                    </li>
                  </ol>
                </section>

                <section>
                  <h2 className="font-bold">2. CONTRACT FOR PARTICIPATION</h2>
                  <p>
                    The contract shall be established when the exhibitor submits
                    the Exhibitor Registration Form duly signed and pays the
                    organizer participation fee.
                  </p>
                </section>

                <section>
                  <h2 className="font-bold">3. ALLOCATION OF EXHIBIT SPACE</h2>
                  <ol className="list-[upper-alpha] pl-5 space-y-2">
                    <li>
                      The organizer shall allocate the space in accordance with
                      the order of contract and advance payment of participation
                      fee.
                    </li>
                    <li>
                      The organizer has the right to change the location
                      allocated to the exhibitor to efficiently manage the
                      exhibition and the exhibitor shall have no claim for
                      compensation.
                    </li>
                  </ol>
                </section>

                <section>
                  <h2 className="font-bold">4. USE OF EXHIBIT SPACE</h2>
                  <ol className="list-[upper-alpha] pl-5 space-y-2">
                    <li>
                      Exhibitors are bound to exhibit the announced products and
                      to staff the exhibits with competent personnel during the
                      whole period of the exhibition.
                    </li>
                    <li>
                      All exhibits must accord with the description on the
                      contract, and be related to the theme of the exhibition.
                      Direct sale without permission of the organizer is
                      strictly prohibited. If the exhibitor violates the
                      above-mentioned rules, the organizer can stop the
                      exhibitor&apos;s activity, remove his/her exhibits or
                      order the dismantling of his/her booth. In this case, the
                      participation fee shall not be refunded and the exhibitor
                      shall have no claim for compensation.
                    </li>
                    <li>
                      The organizer reserves the right to refuse admittance to
                      the exhibition to any person.
                    </li>
                    <li>
                      Exhibitors are not allowed to sublet space allotted to
                      them to other parties, either wholly or in part, without
                      the written consent of the organizer.
                    </li>
                    <li>
                      The organizer Stall Number will be changed as per need of
                      organizer, whereas stall location remain constant.
                    </li>
                  </ol>
                </section>

                <section>
                  <h2 className="font-bold">5. TERMS OF PAYMENT</h2>
                  <ol className="list-[upper-alpha] pl-5">
                    <li>
                      100% advance of participation fee must be paid when
                      submitting the exhibitor agreement
                    </li>
                  </ol>
                </section>

                <section>
                  <h2 className="font-bold">6. CANCELLATION BY EXHIBITOR</h2>
                  <ol className="list-[upper-alpha] pl-5 space-y-2">
                    <li>
                      In the event of abandonment or rejection of all allocated
                      space and/or unpaid participation fee by the exhibitor,
                      the organizer has the right to cancel the exhibitors
                      contract, in this case, the participation fee already paid
                      will not be refunded.
                    </li>
                    <li>
                      All cancellation requests must be made in writing 30 days
                      before the exhibition. In this case, only 50% of the paid
                      charges shall be refunded but after that no refund shall
                      be made.
                    </li>
                  </ol>
                </section>

                <section>
                  <h2 className="font-bold">
                    7. CANCELLATION AND CHANGES OF THE EXHIBITION
                  </h2>
                  <p>
                    In the event of the cancellation of the exhibition by the
                    organizer, the participation fee paid will be refunded. But
                    if the cancellation was caused by force majeure, the fee
                    will not be refunded. The organizer reserves the right to
                    change the venue and duration of the exhibition if
                    exceptional circumstances demand. In this case, the fee paid
                    will not be refunded and the exhibitor shall have no claim
                    for compensation as a result of the changes.
                  </p>
                </section>

                <section>
                  <h2 className="font-bold">
                    8. CONSTRUCTIONS AND DECORATION OF STAND AND DISPLAY
                  </h2>
                  <p>
                    All exhibitors must complete their construction and/or
                    decoration, and move-in and display of exhibits by the date
                    and time stipulated by the organizer. In case of using the
                    exhibition halls over the standard time (08:00-20:00) during
                    a set up & dismantling period, the exhibitor shall use the
                    exhibition hall with the permission of the organizer and the
                    exhibitors shall pay an extra charge to the organizer.
                  </p>
                </section>

                <section>
                  <h2 className="font-bold">
                    9. MOVEMENT OF EXHIBITS AND STAND FITTINGS
                  </h2>
                  <p>
                    Exhibitors shall remove all exhibits and stand fittings from
                    the exhibition hall within the period stipulated by the
                    organizer and indemnify the organizer against any cost
                    incurred by reason of delay or damage to the exhibition
                    hall.
                  </p>
                </section>

                <section>
                  <h2 className="font-bold">
                    10. SECURITIES, RISK AND INSURANCE
                  </h2>
                  <ol className="list-[upper-alpha] pl-5 space-y-2">
                    <li>
                      The organizer shall take all reasonable security
                      precautions in the interests of exhibitors and visitors
                    </li>
                    <li>
                      The exhibitors shall be held responsible for any loss or
                      theft of, or damage to exhibits, stand fittings or any
                      article belonging to the exhibitor during the
                      construction, exhibition and dismantling periods.
                    </li>
                  </ol>
                </section>

                <section>
                  <h2 className="font-bold">11. FIRE REGULATIONS</h2>
                  <ol className="list-[upper-alpha] pl-5 space-y-2">
                    <li>
                      Materials used in stand and display construction must be
                      properly fireproofed in accordance with the regulations of
                      Nepal.
                    </li>
                    <li>
                      In the event that the exhibitor intentionally or
                      negligently causes a fire, theft, breakage or other
                      accidents inflicting damages to the organizer or others,
                      the exhibitor shall be responsible for damages. Exhibitors
                      shall be responsible for insuring goods exhibited.
                    </li>
                  </ol>
                </section>

                <section>
                  <h2 className="font-bold">12. SUPPLEMENTARY CLAUSES</h2>
                  <ol className="list-[upper-alpha] pl-5 space-y-2">
                    <li>
                      Whenever necessary, the organizer shall have the right to
                      take supplementary regulations in addition to those in the
                      regulations for participation in (Birat Expo 2025) to
                      ensure the smooth management of the exhibition.
                    </li>
                    <li>
                      Any additional written regulation instructions shall form
                      part of the terms and regulations for participating in
                      (Birat Expo 2025) and they shall be binding on the
                      exhibitors.
                    </li>
                  </ol>
                </section>

                <section>
                  <h2 className="font-bold">13. ARBITRATION OF DISPUTES</h2>
                  <p>
                    Any dispute, difference, or question which may arise at any
                    time hereafter between the organizer and the exhibitor
                    touching on the true construction of these terms and
                    regulations for participation or the rights and liabilities
                    of the parties hereto shall be finally settled by
                    arbitration in accordance with the Nepal&apos;s law and
                    rules of the Nepalese Court. The award of the above
                    arbitration shall be final and binding upon both parties.
                  </p>
                </section>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <></>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
}
